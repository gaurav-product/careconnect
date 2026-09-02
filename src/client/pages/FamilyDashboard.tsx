import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, ErrorState, Loading, ProgressBar, SectionTitle, Sheet, Field, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api, RequestError } from '../lib/api';
import { clockTime, dateLabel, shortDate, timeAgo, timeLabel } from '../lib/format';
import { trackEvent } from '../lib/analytics';
import type { Alert, CarePlan, Medication, PlanMember, RedFlag } from '../../shared/types';

export const planNav = (id: string) => [
  { to: `/p/${id}`, label: 'Today', end: true },
  { to: `/p/${id}/plan`, label: 'Care plan' },
  { to: `/p/${id}/team`, label: 'Attendants' },
  { to: `/p/${id}/handover`, label: 'Handover pack' },
  { to: `/p/${id}/insights`, label: 'Insights' }
];

interface DaySummary {
  date: string;
  day_number: number;
  logged: number;
  expected: number;
  missed_critical: number;
  documented: boolean;
  shifts: number;
}

interface Bundle {
  plan: CarePlan;
  medications: Medication[];
  members: PlanMember[];
  redFlags: RedFlag[];
  alerts: Alert[];
  summary: DaySummary[];
  my_role: string;
  today: string;
}

interface TodayView {
  slot: 'day' | 'night';
  shift: { started_at: string; ended_at: string | null; attendant_name: string } | null;
  meds: Array<{ name: string; scheduled_time: string; status: string; critical: boolean }>;
}

export function AlertCard({
  alert,
  onChanged,
  planId
}: {
  alert: Alert;
  onChanged: () => void;
  planId: string;
}) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const urgent = alert.severity === 'urgent';

  async function ack() {
    setBusy(true);
    try {
      await api.post(`/alerts/${alert.id}/ack`);
      trackEvent('alert_acknowledged_ui', planId, { type: alert.type, severity: alert.severity });
      notify('Marked as seen.');
      onChanged();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    } finally {
      setBusy(false);
    }
  }

  async function resolve() {
    setError(null);
    if (note.trim().length < 2) {
      setError('Add a short note on what you did — the next attendant will read it.');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/alerts/${alert.id}/resolve`, { note });
      trackEvent('alert_resolved_ui', planId, { type: alert.type, severity: alert.severity });
      setResolving(false);
      setNote('');
      notify('Closed, with your note saved to the record.');
      onChanged();
    } catch (e) {
      setError((e as RequestError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={`rounded-2xl border p-4 ${urgent ? 'border-alert-100 bg-alert-50' : 'border-warn-100 bg-warn-50'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone={urgent ? 'alert' : 'warn'}>{urgent ? 'Needs a decision' : 'Worth a look'}</Badge>
          <h3 className="mt-2 font-semibold text-ink">{alert.title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{alert.detail}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Raised {timeAgo(alert.created_at)}
            {alert.status === 'acknowledged' && ' · you have seen this'}
          </p>
        </div>
      </div>
      {alert.status !== 'resolved' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {alert.status === 'open' && (
            <Button size="sm" variant="secondary" onClick={ack} loading={busy}>
              I have seen this
            </Button>
          )}
          <Button size="sm" variant={urgent ? 'danger' : 'primary'} onClick={() => setResolving(true)}>
            Close with a note
          </Button>
        </div>
      )}
      {alert.status === 'resolved' && alert.resolution_note && (
        <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm text-ink-muted">
          <span className="font-medium text-ink">Closed:</span> {alert.resolution_note}
        </p>
      )}

      <Sheet open={resolving} title="What did you do?" onClose={() => setResolving(false)}>
        <p className="mb-3 text-sm text-ink-muted">
          This note goes into the day's record and into the handover pack, so the next attendant knows what was decided.
        </p>
        <Field label="Your note" error={error ?? undefined} required>
          {(p) => (
            <textarea
              {...p}
              className="cc-input min-h-[100px]"
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Called Dr Menon, he added an antibiotic and wants a dressing change tomorrow."
            />
          )}
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setResolving(false)}>
            Cancel
          </Button>
          <Button onClick={resolve} loading={busy}>
            Save and close
          </Button>
        </div>
      </Sheet>
    </article>
  );
}

export default function FamilyDashboard() {
  const { planId = '' } = useParams();
  const { data, loading, error, reload } = useApi<Bundle>(`/plans/${planId}`);
  const { data: today } = useApi<TodayView>(`/plans/${planId}/today`);

  if (loading) return <AppShell><Loading label="Opening the care record…" /></AppShell>;
  if (error || !data)
    return (
      <AppShell>
        <ErrorState message={error ?? 'This care plan could not be opened.'} onRetry={reload} />
      </AppShell>
    );

  const { plan, summary, alerts, members } = data;
  const openAlerts = alerts.filter((a) => a.status !== 'resolved');
  const urgentCount = openAlerts.filter((a) => a.severity === 'urgent').length;
  const todaySummary = summary.find((s) => s.date === data.today);
  const attendants = members.filter((m) => m.role === 'attendant' && m.status === 'active');
  const dayNumber = todaySummary?.day_number ?? summary[summary.length - 1]?.day_number ?? 1;
  const onDuty = today?.shift && !today.shift.ended_at;

  return (
    <AppShell nav={planNav(planId)} title={`${plan.patient_name} · day ${dayNumber}`}>
      <header className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{plan.patient_name}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {plan.procedure} · discharged {dateLabel(plan.discharge_date)}
            </p>
          </div>
          <Badge tone="info">
            Day {dayNumber} of {plan.episode_days}
          </Badge>
        </div>
      </header>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-muted">Right now</p>
            {onDuty ? (
              <p className="mt-1 text-lg font-semibold text-leaf-700">
                {today!.shift!.attendant_name} is on the {today!.slot} shift
                <span className="ml-2 text-sm font-normal text-ink-soft">
                  since {clockTime(today!.shift!.started_at)}
                </span>
              </p>
            ) : attendants.length === 0 ? (
              <p className="mt-1 text-lg font-semibold text-ink">No attendant added yet</p>
            ) : (
              <p className="mt-1 text-lg font-semibold text-warn-600">Nobody has started the {today?.slot} shift</p>
            )}
          </div>
          {attendants.length === 0 && (
            <Link to={`/p/${planId}/team`}>
              <Button>Add the attendant</Button>
            </Link>
          )}
        </div>
      </Card>

      {openAlerts.length > 0 && (
        <section className="mb-5" aria-labelledby="alerts-heading">
          <SectionTitle>
            <span id="alerts-heading">
              Needs you {urgentCount > 0 && <span className="text-alert-600">({urgentCount} urgent)</span>}
            </span>
          </SectionTitle>
          <p className="mb-3 text-sm text-ink-soft">
            These are flags raised by what was recorded at home. CareConnect does not diagnose anything — decide with the
            treating doctor, and call an ambulance in an emergency.
          </p>
          <div className="space-y-3">
            {openAlerts
              .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'urgent' ? -1 : 1))
              .map((a) => (
                <AlertCard key={a.id} alert={a} planId={planId} onChanged={reload} />
              ))}
          </div>
        </section>
      )}

      <Card className="mb-4">
        <SectionTitle
          action={
            <Link className="text-sm font-medium text-leaf-600 underline" to={`/p/${planId}/day/${data.today}`}>
              See the full day
            </Link>
          }
        >
          Today's care
        </SectionTitle>
        {todaySummary ? (
          <>
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm text-ink-muted">
                <span className="text-2xl font-semibold text-ink">{todaySummary.logged}</span> of{' '}
                {todaySummary.expected} things recorded
              </p>
              {todaySummary.missed_critical > 0 && (
                <Badge tone="alert">{todaySummary.missed_critical} important item missed</Badge>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar
                value={todaySummary.logged}
                max={todaySummary.expected}
                tone={todaySummary.missed_critical ? 'warn' : 'good'}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Nothing has been recorded today yet.</p>
        )}
        {today && today.meds.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {today.meds.slice(0, 5).map((m) => (
              <li key={`${m.name}${m.scheduled_time}`} className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">
                  {timeLabel(m.scheduled_time)} · {m.name}
                  {m.critical && <span className="ml-1 text-alert-500" title="Must not be missed">•</span>}
                </span>
                <Badge tone={m.status === 'given' ? 'good' : m.status === 'pending' ? 'neutral' : 'alert'}>
                  {m.status === 'pending' ? 'not recorded yet' : m.status.replace(/_/g, ' ')}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>The week so far</SectionTitle>
        <p className="mb-3 text-sm text-ink-soft">
          A day is <strong>fully documented</strong> when every must-not-miss item was recorded and no urgent alert was
          left open. It means the record is complete — not that CareConnect checked the care itself.
        </p>
        <ul className="grid grid-cols-7 gap-1.5">
          {summary.map((s) => (
            <li key={s.date}>
              <Link
                to={`/p/${planId}/day/${s.date}`}
                className="block rounded-xl border border-sand-200 bg-white p-2 text-center transition-colors hover:border-leaf-500"
              >
                <span className="block text-[11px] text-ink-soft">{shortDate(s.date)}</span>
                <span
                  className={`mx-auto mt-1.5 block h-7 w-7 rounded-full text-center text-xs font-semibold leading-7 ${
                    s.documented
                      ? 'bg-leaf-500 text-white'
                      : s.missed_critical > 0
                        ? 'bg-alert-500 text-white'
                        : 'bg-sand-100 text-ink-soft'
                  }`}
                  aria-label={`Day ${s.day_number}: ${s.documented ? 'fully documented' : s.missed_critical ? 'important item missed' : 'incomplete record'}`}
                >
                  {s.day_number}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
