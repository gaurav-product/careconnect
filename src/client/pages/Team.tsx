import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, EmptyState, ErrorState, Field, Loading, SectionTitle, Sheet, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api, RequestError } from '../lib/api';
import { dateLabel } from '../lib/format';
import { planNav } from './FamilyDashboard';
import { trackEvent } from '../lib/analytics';
import type { PlanMember } from '../../shared/types';

export default function TeamPage() {
  const { planId = '' } = useParams();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const { notify } = useToast();
  const { data, loading, error, reload } = useApi<{ members: PlanMember[] }>(`/plans/${planId}/members`);
  const { data: handovers, reload: reloadHandovers } = useApi<{
    handovers: Array<{ id: string; created_at: string; reason: string | null; from_name: string | null }>;
  }>(`/plans/${planId}/handovers`);

  const [adding, setAdding] = useState(isNew);
  const [form, setForm] = useState({ display_name: '', phone: '', agency_name: '' });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [newCode, setNewCode] = useState<{ name: string; code: string } | null>(null);
  const [ending, setEnding] = useState<PlanMember | null>(null);
  const [endReason, setEndReason] = useState('');

  async function addAttendant() {
    setBusy(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await api.post<{ invite_code: string }>(`/plans/${planId}/members`, {
        display_name: form.display_name,
        phone: form.phone || undefined,
        agency_name: form.agency_name || null,
        role: 'attendant'
      });
      trackEvent('attendant_invited_ui', planId);
      setNewCode({ name: form.display_name, code: res.invite_code });
      setForm({ display_name: '', phone: '', agency_name: '' });
      setAdding(false);
      reload();
    } catch (e) {
      const err = e as RequestError;
      setFormError(err.message);
      setFieldErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  }

  async function endMember() {
    if (!ending) return;
    setBusy(true);
    try {
      await api.post(`/plans/${planId}/members/${ending.id}/end`, { reason: endReason || undefined });
      trackEvent('attendant_ended_ui', planId);
      notify('Attendant ended. A handover pack has been saved for whoever comes next.');
      setEnding(null);
      setEndReason('');
      reload();
      reloadHandovers();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <AppShell nav={planNav(planId)}><Loading /></AppShell>;
  if (error || !data)
    return (
      <AppShell nav={planNav(planId)}>
        <ErrorState message={error ?? 'Could not load the attendants.'} onRetry={reload} />
      </AppShell>
    );

  const attendants = data.members.filter((m) => m.role === 'attendant');
  const active = attendants.filter((m) => m.status !== 'ended');

  return (
    <AppShell nav={planNav(planId)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendants</h1>
          <p className="mt-1 text-sm text-ink-muted">
            CareConnect does not supply attendants. Add whoever you have hired — from an agency or otherwise — and the
            record follows the patient, not the person.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>Add an attendant</Button>
      </div>

      {isNew && active.length === 0 && (
        <Card className="mb-4 border-leaf-300 bg-leaf-50">
          <p className="font-semibold">Your care plan is ready.</p>
          <p className="mt-1 text-sm text-ink-muted">
            One thing left: add the attendant and send them the 6-character code. Nothing gets recorded until someone is
            on duty.
          </p>
        </Card>
      )}

      {newCode && (
        <Card className="mb-4 border-leaf-500">
          <SectionTitle>Send this code to {newCode.name}</SectionTitle>
          <p className="text-3xl font-semibold tracking-[0.3em] text-leaf-700">{newCode.code}</p>
          <p className="mt-2 text-sm text-ink-muted">
            Ask them to install nothing — they open the site, tap “I am an attendant”, and enter this code once.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigator.clipboard?.writeText(
                  `CareConnect: please open the link the family sent, choose "I am an attendant" and enter code ${newCode.code}`
                );
                notify('Message copied — paste it into WhatsApp.');
              }}
            >
              Copy WhatsApp message
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNewCode(null)}>
              Done
            </Button>
          </div>
        </Card>
      )}

      {attendants.length === 0 ? (
        <EmptyState
          title="No attendant added yet"
          message="Add the person who is physically with the patient. They record each shift; you see it."
          action={<Button onClick={() => setAdding(true)}>Add an attendant</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {attendants.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{m.display_name}</p>
                    <p className="text-sm text-ink-soft">
                      {m.agency_name || 'Hired directly'}
                      {m.phone && ` · ${m.phone}`}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {m.started_at ? `On this plan since ${dateLabel(m.started_at.slice(0, 10))}` : 'Invite not yet used'}
                      {m.ended_at && ` · ended ${dateLabel(m.ended_at.slice(0, 10))}`}
                      {m.end_reason && ` — ${m.end_reason}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={m.status === 'active' ? 'good' : m.status === 'invited' ? 'warn' : 'neutral'}>
                      {m.status === 'invited' ? 'invite sent' : m.status}
                    </Badge>
                    {m.status === 'invited' && m.invite_code && (
                      <span className="rounded-lg bg-sand-100 px-2 py-1 font-mono text-sm tracking-widest">{m.invite_code}</span>
                    )}
                    {m.status !== 'ended' && (
                      <Button size="sm" variant="ghost" onClick={() => setEnding(m)}>
                        End on this plan
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {handovers && handovers.handovers.length > 0 && (
        <Card className="mt-5">
          <SectionTitle>Handovers so far</SectionTitle>
          <ul className="space-y-2 text-sm">
            {handovers.handovers.map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 border-b border-sand-100 pb-2 last:border-0">
                <span className="text-ink-muted">
                  {h.from_name ?? 'Someone'} handed over
                  {h.reason ? ` — ${h.reason}` : ''}
                </span>
                <span className="text-ink-soft">{dateLabel(h.created_at.slice(0, 10))}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Sheet open={adding} title="Add an attendant" onClose={() => setAdding(false)}>
        <div className="space-y-4">
          <Field label="Their name" error={fieldErrors.display_name?.[0]} required>
            {(p) => (
              <input
                {...p}
                className="cc-input"
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              />
            )}
          </Field>
          <Field label="Their mobile number" hint="Optional — used only so you can reach them." error={fieldErrors.phone?.[0]}>
            {(p) => (
              <input
                {...p}
                className="cc-input"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
              />
            )}
          </Field>
          <Field label="Agency" hint="Leave blank if you hired them directly.">
            {(p) => (
              <input
                {...p}
                className="cc-input"
                value={form.agency_name}
                onChange={(e) => setForm((f) => ({ ...f, agency_name: e.target.value }))}
              />
            )}
          </Field>
          {formError && <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={addAttendant} loading={busy} disabled={form.display_name.trim().length < 2}>
              Create invite code
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet open={Boolean(ending)} title={`End ${ending?.display_name ?? ''} on this plan`} onClose={() => setEnding(null)}>
        <p className="text-sm text-ink-muted">
          Their access stops immediately and a handover pack is saved — the medicines, the routine, the warning signs and
          the last seven days — ready for whoever takes over.
        </p>
        <div className="mt-4">
          <Field label="Why are they leaving?" hint="This shows in the handover so the next person has context.">
            {(p) => (
              <input
                {...p}
                className="cc-input"
                value={endReason}
                maxLength={200}
                onChange={(e) => setEndReason(e.target.value)}
                placeholder="e.g. Agency rotated her to another case"
              />
            )}
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEnding(null)}>Keep them</Button>
          <Button variant="danger" onClick={endMember} loading={busy}>
            End and save handover
          </Button>
        </div>
      </Sheet>
    </AppShell>
  );
}
