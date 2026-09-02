import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Logo } from '../components/AppShell';
import { Badge, Button, Card, ErrorState, Field, Loading, Sheet, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api, RequestError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { readingValue, timeLabel } from '../lib/format';
import { trackEvent } from '../lib/analytics';
import { VITAL_META, type CarePlan, type RedFlag, type VitalCheck } from '../../shared/types';

interface TodayView {
  plan: CarePlan;
  date: string;
  slot: 'day' | 'night';
  my_role: string;
  shift: { id: string; started_at: string; ended_at: string | null; attendant_name: string; member_id: string } | null;
  is_my_shift: boolean;
  tasks: Array<{ id: string; title_en: string; title_hi: string; critical: boolean; status: string; reason: string | null }>;
  meds: Array<{
    medication_id: string;
    name: string;
    dose: string;
    instruction: string | null;
    critical: boolean;
    scheduled_time: string;
    status: string;
    reason: string | null;
  }>;
  vitals: Array<VitalCheck & { last_today: { value1: number; value2: number | null } | null }>;
  red_flags: RedFlag[];
  last_handover_note: { handover_note: string; display_name: string } | null;
}

/** Two-language row label: attendants are usually Hindi-first, families write in English. */
function Bi({ en, hi }: { en: string; hi: string }) {
  return (
    <span className="block">
      <span className="block font-medium leading-tight">{en}</span>
      {hi && hi !== en && <span className="block text-sm text-ink-soft">{hi}</span>}
    </span>
  );
}

export default function AttendantToday() {
  const { user } = useAuth();
  const { notify } = useToast();
  const { data: plans, loading: loadingPlans } = useApi<{ plans: Array<{ id: string }> }>('/plans');
  const planId = plans?.plans[0]?.id ?? null;
  const { data, loading, error, reload } = useApi<TodayView>(planId ? `/plans/${planId}/today` : null);

  const [busy, setBusy] = useState<string | null>(null);
  const [reasonFor, setReasonFor] = useState<
    | { kind: 'task'; id: string; label: string }
    | { kind: 'med'; id: string; time: string; label: string; status: 'missed' | 'refused' }
    | null
  >(null);
  const [reason, setReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportFlag, setReportFlag] = useState<string | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [vitalFor, setVitalFor] = useState<VitalCheck | null>(null);
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [closing, setClosing] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState<string | null>(null);

  const pending = useMemo(() => {
    if (!data) return 0;
    return data.tasks.filter((t) => t.status === 'pending').length + data.meds.filter((m) => m.status === 'pending').length;
  }, [data]);

  if (user?.role === 'family') return <Navigate to="/plans" replace />;
  if (loadingPlans || loading) return <Loading label="Opening today's duty…" />;
  if (!planId)
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <ErrorState
          title="You are not on a patient yet"
          message="Ask the family for the 6-character invite code, then open the Join screen."
        />
        <div className="mt-4 flex justify-center">
          <Link to="/join">
            <Button>Enter invite code</Button>
          </Link>
        </div>
      </div>
    );
  if (error || !data) return <ErrorState message={error ?? 'Today could not be loaded.'} onRetry={reload} />;

  const onDuty = data.is_my_shift && data.shift && !data.shift.ended_at;
  const someoneElse = data.shift && !data.is_my_shift && !data.shift.ended_at;

  async function startShift() {
    setBusy('shift');
    try {
      await api.post(`/plans/${planId}/shifts`);
      trackEvent('shift_started_ui', planId, { slot: data!.slot });
      notify('Shift started. सब कुछ यहीं दर्ज करें।');
      reload();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    } finally {
      setBusy(null);
    }
  }

  async function logTask(id: string, status: 'done' | 'missed', reasonText?: string) {
    setBusy(id);
    try {
      await api.post(`/shifts/${data!.shift!.id}/tasks`, { task_id: id, status, reason: reasonText ?? null });
      trackEvent('task_logged_ui', planId, { status });
      setUnsaved(null);
      reload();
    } catch (e) {
      const err = e as RequestError;
      // A transient toast is the wrong pattern on a patchy connection: the attendant
      // looks away, the toast dies, and they believe the entry saved. This stays put.
      setUnsaved(err.status === 0 ? 'network' : err.message);
      notify(err.message, 'alert');
    } finally {
      setBusy(null);
    }
  }

  async function logMed(id: string, time: string, status: string, reasonText?: string) {
    setBusy(id + time);
    try {
      await api.post(`/shifts/${data!.shift!.id}/meds`, {
        medication_id: id,
        scheduled_time: time,
        status,
        reason: reasonText ?? null
      });
      trackEvent('medication_logged_ui', planId, { status });
      setUnsaved(null);
      reload();
    } catch (e) {
      const err = e as RequestError;
      setUnsaved(err.status === 0 ? 'network' : err.message);
      notify(err.message, 'alert');
    } finally {
      setBusy(null);
    }
  }

  async function submitReason() {
    if (reason.trim().length < 2) {
      setFormError('Please write one line. परिवार को यह दिखेगा।');
      return;
    }
    const target = reasonFor!;
    setReasonFor(null);
    const text = reason;
    setReason('');
    setFormError(null);
    if (target.kind === 'task') await logTask(target.id, 'missed', text);
    else await logMed(target.id, target.time, target.status, text);
  }

  async function saveVital() {
    if (!vitalFor) return;
    const n1 = Number(v1);
    if (!n1) {
      setFormError('Enter the reading. रीडिंग लिखें।');
      return;
    }
    if (vitalFor.type === 'bp' && !Number(v2)) {
      setFormError('Blood pressure needs both numbers. दोनों नंबर लिखें।');
      return;
    }
    setBusy('vital');
    try {
      const res = await api.post<{ out_of_range: boolean }>(`/shifts/${data!.shift!.id}/vitals`, {
        type: vitalFor.type,
        value1: n1,
        value2: v2 ? Number(v2) : null
      });
      trackEvent('vital_logged_ui', planId, { type: vitalFor.type, out_of_range: res.out_of_range });
      notify(res.out_of_range ? 'Saved — the family has been alerted about this reading.' : 'Reading saved.');
      setVitalFor(null);
      setV1('');
      setV2('');
      setFormError(null);
      reload();
    } catch (e) {
      setFormError((e as RequestError).message);
    } finally {
      setBusy(null);
    }
  }

  async function submitReport() {
    if (reportNote.trim().length < 3) {
      setFormError('Please describe what you saw. क्या देखा, लिखें।');
      return;
    }
    setBusy('report');
    try {
      await api.post(`/plans/${planId}/observations`, {
        red_flag_id: reportFlag,
        note: reportNote,
        severity: 'watch'
      });
      trackEvent('observation_reported_ui', planId, { from_flag: Boolean(reportFlag) });
      notify('Reported. The family has been alerted. परिवार को बता दिया गया।');
      setReporting(false);
      setReportFlag(null);
      setReportNote('');
      setFormError(null);
      reload();
    } catch (e) {
      setFormError((e as RequestError).message);
    } finally {
      setBusy(null);
    }
  }

  async function closeShift() {
    setBusy('close');
    try {
      const res = await api.post<{ unlogged: number }>(`/shifts/${data!.shift!.id}/close`, {
        handover_note: closeNote || null
      });
      trackEvent('shift_closed_ui', planId, { unlogged: res.unlogged });
      notify('Shift closed. धन्यवाद।');
      setClosing(false);
      setCloseNote('');
      reload();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-28">
      <header className="sticky top-0 z-30 border-b border-sand-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Logo compact />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold leading-tight">{data.plan.patient_name}</h1>
            <p className="text-xs text-ink-soft">
              {data.slot === 'day' ? 'Day shift · दिन की ड्यूटी' : 'Night shift · रात की ड्यूटी'}
            </p>
          </div>
          {onDuty && <Badge tone="good">On duty</Badge>}
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {data.plan.emergency_contact_phone && (
          <a
            href={`tel:${data.plan.emergency_contact_phone}`}
            className="flex items-center justify-between rounded-xl border border-alert-100 bg-alert-50 px-4 py-3 text-sm font-semibold text-alert-600"
          >
            <span>Emergency · आपातकाल: call {data.plan.emergency_contact_name || 'family'}</span>
            <span aria-hidden="true">→</span>
          </a>
        )}

        {unsaved && (
          <div className="rounded-xl border border-alert-100 bg-alert-50 px-4 py-3" role="alert">
            <p className="font-semibold text-alert-600">Your last entry did not save</p>
            <p className="mt-1 text-sm text-ink-muted">
              {unsaved === 'network'
                ? 'The phone lost its connection. Nothing was recorded — tap the button again when the signal is back.'
                : unsaved}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              आपकी पिछली एंट्री सेव नहीं हुई। नेटवर्क आने पर दोबारा दबाएं।
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            to={`/p/${planId}/handover`}
            className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-3 text-center text-sm font-semibold text-leaf-700"
          >
            Full care plan · पूरा प्लान
          </Link>
          <Link
            to={`/p/${planId}/plan`}
            className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-3 text-center text-sm font-semibold text-leaf-700"
          >
            Medicines list · दवा सूची
          </Link>
        </div>

        {!onDuty && (
          <>
            {data.last_handover_note && (
              <Card className="border-leaf-300 bg-leaf-50">
                <p className="text-sm font-semibold">Read this first · पहले यह पढ़ें</p>
                <p className="mt-1.5 text-[15px]">“{data.last_handover_note.handover_note}”</p>
                <p className="mt-1 text-xs text-ink-soft">— {data.last_handover_note.display_name}</p>
              </Card>
            )}
            {someoneElse ? (
              <Card>
                <p className="font-semibold">{data.shift!.attendant_name} is already on this shift.</p>
                <p className="mt-1 text-sm text-ink-muted">
                  If that is wrong, ask the family to check the roster. दूसरा व्यक्ति ड्यूटी पर है।
                </p>
              </Card>
            ) : (
              <Card className="text-center">
                <p className="text-lg font-semibold">Ready to start?</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Nothing is recorded until you start your shift. ड्यूटी शुरू करने के बाद ही सब दर्ज होगा।
                </p>
                <Button size="lg" block className="mt-4" onClick={startShift} loading={busy === 'shift'}>
                  Start my shift · ड्यूटी शुरू करें
                </Button>
              </Card>
            )}
          </>
        )}

        {onDuty && (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Medicines · दवाइयाँ</h2>
                <span className="text-sm text-ink-soft">{data.meds.filter((m) => m.status !== 'pending').length}/{data.meds.length}</span>
              </div>
              {data.meds.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">No medicines are due on this shift.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {data.meds.map((m) => (
                    <li key={m.medication_id + m.scheduled_time} className="rounded-xl border border-sand-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {m.name} <span className="font-normal text-ink-soft">{m.dose}</span>
                            {m.critical && <Badge tone="alert" className="ml-2">must not miss</Badge>}
                          </p>
                          <p className="text-sm text-ink-soft">
                            {timeLabel(m.scheduled_time)}
                            {m.instruction && ` · ${m.instruction}`}
                          </p>
                        </div>
                        {m.status !== 'pending' && (
                          <Badge tone={m.status === 'given' ? 'good' : 'alert'}>{m.status.replace(/_/g, ' ')}</Badge>
                        )}
                      </div>
                      {m.status === 'pending' ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            size="lg"
                            loading={busy === m.medication_id + m.scheduled_time}
                            onClick={() => logMed(m.medication_id, m.scheduled_time, 'given')}
                          >
                            Given · दे दी
                          </Button>
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={() =>
                              setReasonFor({
                                kind: 'med',
                                id: m.medication_id,
                                time: m.scheduled_time,
                                label: m.name,
                                status: 'missed'
                              })
                            }
                          >
                            Not given · नहीं दी
                          </Button>
                        </div>
                      ) : (
                        m.reason && <p className="mt-2 text-sm text-alert-600">“{m.reason}”</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Care tasks · देखभाल के काम</h2>
                <span className="text-sm text-ink-soft">
                  {data.tasks.filter((t) => t.status !== 'pending').length}/{data.tasks.length}
                </span>
              </div>
              <ul className="mt-3 space-y-3">
                {data.tasks.map((t) => (
                  <li key={t.id} className="rounded-xl border border-sand-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <Bi en={t.title_en} hi={t.title_hi} />
                      {t.status !== 'pending' && (
                        <Badge tone={t.status === 'done' ? 'good' : 'alert'}>{t.status === 'done' ? 'done' : 'missed'}</Badge>
                      )}
                    </div>
                    {t.status === 'pending' ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button size="lg" loading={busy === t.id} onClick={() => logTask(t.id, 'done')}>
                          Done · हो गया
                        </Button>
                        <Button
                          size="lg"
                          variant="secondary"
                          onClick={() => setReasonFor({ kind: 'task', id: t.id, label: t.title_en })}
                        >
                          Could not · नहीं हुआ
                        </Button>
                      </div>
                    ) : (
                      t.reason && <p className="mt-2 text-sm text-alert-600">“{t.reason}”</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>

            {data.vitals.length > 0 && (
              <Card>
                <h2 className="text-base font-semibold">Readings · रीडिंग</h2>
                <ul className="mt-3 space-y-2">
                  {data.vitals.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 p-3">
                      <div>
                        <p className="font-medium">{VITAL_META[v.type]?.label}</p>
                        <p className="text-sm text-ink-soft">
                          {v.last_today
                            ? `Today: ${readingValue(v.last_today.value1)}${v.last_today.value2 ? `/${readingValue(v.last_today.value2)}` : ''} ${VITAL_META[v.type]?.unit}`
                            : 'Not taken today'}
                        </p>
                      </div>
                      <Button variant={v.last_today ? 'secondary' : 'primary'} onClick={() => setVitalFor(v)}>
                        {v.last_today ? 'Add again' : 'Enter'}
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="border-warn-100 bg-warn-50">
              <h2 className="text-base font-semibold">Something wrong? · कुछ गड़बड़ है?</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Tell the family straight away — it goes into the record and alerts them the moment they open CareConnect.
              </p>
              <Button variant="danger" size="lg" block className="mt-3" onClick={() => setReporting(true)}>
                Report a problem · समस्या बताएं
              </Button>
            </Card>
          </>
        )}
      </main>

      {onDuty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <p className="flex-1 text-sm text-ink-muted">
              {pending === 0 ? 'Everything recorded · सब दर्ज' : `${pending} still to record · दर्ज करना बाकी`}
            </p>
            <Button variant={pending === 0 ? 'primary' : 'secondary'} onClick={() => setClosing(true)}>
              End shift · ड्यूटी खत्म
            </Button>
          </div>
        </div>
      )}

      <footer className="mx-auto mt-8 max-w-lg px-4 pb-4 text-center text-xs text-ink-soft">
        <span className="mx-auto mb-3 block max-w-md rounded-xl border border-sand-200 bg-white px-3 py-2 text-left text-ink-muted">
          <strong className="text-ink">What the family can see:</strong> what you record here, the time you recorded it,
          and your name on the shift. Nothing else — no location, no camera, no microphone. You can read the full care
          plan and the handover any time.
          <span className="mt-1 block">
            परिवार सिर्फ़ वही देखता है जो आप यहाँ लिखते हैं — समय और आपका नाम। लोकेशन या कैमरा नहीं।
          </span>
        </span>
        CareConnect keeps a record. It does not give medical advice and it is not an emergency service — in an emergency,
        call an ambulance and the family first.
        <span className="mt-1 block">
          यह ऐप सिर्फ़ रिकॉर्ड रखता है। आपात स्थिति में पहले एम्बुलेंस और परिवार को कॉल करें।
        </span>
      </footer>

      <Sheet
        open={Boolean(reasonFor)}
        title={`What happened? · क्या हुआ?`}
        onClose={() => {
          setReasonFor(null);
          setFormError(null);
        }}
      >
        <p className="mb-3 text-sm text-ink-muted">
          <strong>{reasonFor?.label}</strong> — the family will read this line, so keep it simple and honest.
        </p>
        {reasonFor?.kind === 'med' && (
          <div className="mb-3 flex gap-2">
            {(['missed', 'refused'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={reasonFor.status === s ? 'primary' : 'secondary'}
                onClick={() => setReasonFor({ ...reasonFor, status: s })}
              >
                {s === 'missed' ? 'Not given · नहीं दी' : 'He/she refused · मना कर दिया'}
              </Button>
            ))}
          </div>
        )}
        <Field label="Reason · कारण" error={formError ?? undefined} required>
          {(p) => (
            <textarea
              {...p}
              className="cc-input min-h-[90px]"
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Strip finished, chemist was shut"
            />
          )}
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReasonFor(null)}>
            Cancel · रद्द
          </Button>
          <Button onClick={submitReason}>Save · सेव</Button>
        </div>
      </Sheet>

      <Sheet
        open={Boolean(vitalFor)}
        title={`${VITAL_META[vitalFor?.type ?? 'bp']?.label ?? 'Reading'}`}
        onClose={() => {
          setVitalFor(null);
          setFormError(null);
        }}
      >
        <div className="space-y-4">
          <Field
            label={vitalFor?.type === 'bp' ? 'Upper (systolic) · ऊपर वाला' : `Reading (${VITAL_META[vitalFor?.type ?? 'bp']?.unit})`}
            error={formError ?? undefined}
            required
          >
            {(p) => (
              <input
                {...p}
                className="cc-input text-2xl"
                inputMode="decimal"
                value={v1}
                onChange={(e) => setV1(e.target.value.replace(/[^\d.]/g, ''))}
              />
            )}
          </Field>
          {vitalFor?.type === 'bp' && (
            <Field label="Lower (diastolic) · नीचे वाला" required>
              {(p) => (
                <input
                  {...p}
                  className="cc-input text-2xl"
                  inputMode="decimal"
                  value={v2}
                  onChange={(e) => setV2(e.target.value.replace(/[^\d.]/g, ''))}
                />
              )}
            </Field>
          )}
          <p className="text-sm text-ink-soft">
            Normal for this patient: {vitalFor?.low ?? '—'}–{vitalFor?.high ?? '—'}. If it is outside that, the family is
            told automatically.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setVitalFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveVital} loading={busy === 'vital'}>
              Save · सेव
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet
        open={reporting}
        title="Report a problem · समस्या बताएं"
        onClose={() => {
          setReporting(false);
          setFormError(null);
        }}
      >
        <p className="mb-3 text-sm text-ink-muted">
          Pick a warning sign if it matches, or just write what you saw. If this is an emergency, call the family and an
          ambulance first.
        </p>
        <ul className="mb-4 flex flex-wrap gap-2">
          {data.red_flags.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setReportFlag(reportFlag === f.id ? null : f.id)}
                aria-pressed={reportFlag === f.id}
                className={`rounded-full border px-3 py-2 text-left text-sm ${
                  reportFlag === f.id ? 'border-alert-500 bg-alert-50 text-alert-600' : 'border-sand-200 bg-white'
                }`}
              >
                <span className="block font-medium">{f.label_en}</span>
                <span className="block text-xs text-ink-soft">{f.label_hi}</span>
              </button>
            </li>
          ))}
        </ul>
        <Field label="What did you see? · क्या देखा?" error={formError ?? undefined} required>
          {(p) => (
            <textarea
              {...p}
              className="cc-input min-h-[100px]"
              value={reportNote}
              maxLength={500}
              onChange={(e) => setReportNote(e.target.value)}
            />
          )}
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReporting(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submitReport} loading={busy === 'report'}>
            Tell the family · परिवार को बताएं
          </Button>
        </div>
      </Sheet>

      <Sheet open={closing} title="End your shift · ड्यूटी खत्म करें" onClose={() => setClosing(false)}>
        {pending > 0 && (
          <p className="mb-3 rounded-lg bg-warn-50 px-3 py-2 text-sm text-warn-600">
            {pending} item{pending > 1 ? 's are' : ' is'} still not recorded. The family will see them as blank.
          </p>
        )}
        <Field label="Note for the next person · अगले व्यक्ति के लिए नोट" hint="Optional but it is what makes the next shift go well.">
          {(p) => (
            <textarea
              {...p}
              className="cc-input min-h-[100px]"
              value={closeNote}
              maxLength={500}
              onChange={(e) => setCloseNote(e.target.value)}
              placeholder="e.g. Slept well, ate half the dinner, complained of pain in the evening"
            />
          )}
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setClosing(false)}>
            Keep working
          </Button>
          <Button onClick={closeShift} loading={busy === 'close'}>
            End shift · खत्म करें
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
