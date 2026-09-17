import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, ErrorState, Field, Loading, SectionTitle, Sheet, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api, RequestError } from '../lib/api';
import { timeLabel } from '../lib/format';
import { planNav } from './FamilyDashboard';
import type { CarePlan, CareTask, Medication, RedFlag, VitalCheck } from '../../shared/types';
import { VITAL_META } from '../../shared/types';

interface Bundle {
  plan: CarePlan;
  medications: Medication[];
  tasks: CareTask[];
  vitals: VitalCheck[];
  redFlags: RedFlag[];
  my_role: string;
}

export default function PlanEditor() {
  const { planId = '' } = useParams();
  const { notify } = useToast();
  const { data, loading, error, reload } = useApi<Bundle>(`/plans/${planId}`);
  const [addingMed, setAddingMed] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [med, setMed] = useState({ name: '', dose: '', times: ['09:00'], instruction: '', critical: false });
  const [task, setTask] = useState({ title_en: '', title_hi: '', window: 'morning', critical: false });

  const readOnly = data?.my_role === 'attendant';

  async function saveMed() {
    setBusy(true);
    setFieldErrors({});
    setSaveError(null);
    try {
      await api.post(`/plans/${planId}/medications`, { ...med, instruction: med.instruction || null });
      notify('Medicine added to the plan.');
      setAddingMed(false);
      setMed({ name: '', dose: '', times: ['09:00'], instruction: '', critical: false });
      reload();
    } catch (e) {
      const err = e as RequestError;
      setFieldErrors(err.details || {});
      setSaveError(err.message);
      notify(err.message, 'alert');
    } finally {
      setBusy(false);
    }
  }

  async function saveTask() {
    setBusy(true);
    setFieldErrors({});
    setSaveError(null);
    try {
      await api.post(`/plans/${planId}/tasks`, { ...task, title_hi: task.title_hi || undefined, category: 'other' });
      notify('Task added to the daily routine.');
      setAddingTask(false);
      setTask({ title_en: '', title_hi: '', window: 'morning', critical: false });
      reload();
    } catch (e) {
      const err = e as RequestError;
      setFieldErrors(err.details || {});
      setSaveError(err.message);
      notify(err.message, 'alert');
    } finally {
      setBusy(false);
    }
  }

  async function stopMed(id: string, name: string) {
    if (!window.confirm(`Stop ${name}? It will no longer appear on the attendant's screen.`)) return;
    try {
      await api.del(`/plans/${planId}/medications/${id}`);
      notify(`${name} stopped.`);
      reload();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    }
  }

  async function removeTask(id: string, title: string) {
    if (!window.confirm(`Remove “${title}” from the daily routine?`)) return;
    try {
      await api.del(`/plans/${planId}/tasks/${id}`);
      notify('Task removed.');
      reload();
    } catch (e) {
      notify((e as RequestError).message, 'alert');
    }
  }

  if (loading) return <AppShell nav={planNav(planId)}><Loading /></AppShell>;
  if (error || !data)
    return (
      <AppShell nav={planNav(planId)}>
        <ErrorState message={error ?? 'Could not open the care plan.'} onRetry={reload} />
      </AppShell>
    );

  return (
    <AppShell nav={planNav(planId)}>
      <h1 className="text-2xl font-semibold tracking-tight">Care plan</h1>
      <p className="mb-5 mt-1 max-w-2xl text-sm text-ink-muted">
        This is what the attendant sees each shift. Check it against the discharge summary — CareConnect starts you off
        with a routine for this kind of recovery, but only your doctor's sheet is authoritative.
      </p>

      <Card className="mb-4">
        <SectionTitle action={!readOnly && <Button size="sm" onClick={() => setAddingMed(true)}>Add medicine</Button>}>
          Medicines ({data.medications.length})
        </SectionTitle>
        <ul className="divide-y divide-sand-100">
          {data.medications.map((m) => (
            <li key={m.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium">
                  {m.name} <span className="font-normal text-ink-soft">{m.dose}</span>
                  {m.critical && <Badge tone="alert" className="ml-2">must not be missed</Badge>}
                </p>
                <p className="text-sm text-ink-muted">
                  {m.times.map(timeLabel).join(' · ')}
                  {m.instruction && ` — ${m.instruction}`}
                </p>
              </div>
              {!readOnly && (
                <Button size="sm" variant="ghost" onClick={() => stopMed(m.id, m.name)}>
                  Stop
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <SectionTitle action={!readOnly && <Button size="sm" onClick={() => setAddingTask(true)}>Add task</Button>}>
          Daily routine ({data.tasks.length})
        </SectionTitle>
        <ul className="divide-y divide-sand-100">
          {data.tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium">
                  {t.title_en}
                  {t.critical && <span className="ml-1.5 text-alert-500" title="Important">•</span>}
                </p>
                <p className="text-sm text-ink-soft">
                  {t.title_hi} · {t.window}
                </p>
              </div>
              {!readOnly && (
                <Button size="sm" variant="ghost" onClick={() => removeTask(t.id, t.title_en)}>
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle>Readings to take</SectionTitle>
          <ul className="space-y-2 text-sm">
            {data.vitals.map((v) => (
              <li key={v.id}>
                <span className="font-medium">{VITAL_META[v.type]?.label ?? v.type}</span>
                <span className="block text-ink-soft">
                  {v.times.map(timeLabel).join(' · ')} · normal {v.low ?? '—'}–{v.high ?? '—'} {VITAL_META[v.type]?.unit}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle>Warning signs</SectionTitle>
          <ul className="space-y-1.5 text-sm">
            {data.redFlags.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${f.severity === 'urgent' ? 'bg-alert-500' : 'bg-warn-600'}`} />
                <span>{f.label_en}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Sheet open={addingMed} title="Add a medicine" onClose={() => setAddingMed(false)}>
        <div className="space-y-4">
          <Field label="Medicine" error={fieldErrors.name?.[0]} required>
            {(p) => <input {...p} className="cc-input" value={med.name} onChange={(e) => setMed({ ...med, name: e.target.value })} />}
          </Field>
          <Field label="Dose" error={fieldErrors.dose?.[0]} required>
            {(p) => <input {...p} className="cc-input" value={med.dose} onChange={(e) => setMed({ ...med, dose: e.target.value })} placeholder="e.g. 500 mg" />}
          </Field>
          <div>
            <span className="cc-label">Times</span>
            <div className="flex flex-wrap items-center gap-2">
              {med.times.map((t, i) => (
                <input
                  key={i}
                  className="cc-input w-32"
                  type="time"
                  aria-label={`Dose time ${i + 1}`}
                  value={t}
                  onChange={(e) => setMed({ ...med, times: med.times.map((x, j) => (j === i ? e.target.value : x)) })}
                />
              ))}
              {med.times.length < 6 && (
                <Button size="sm" variant="ghost" onClick={() => setMed({ ...med, times: [...med.times, '21:00'] })}>
                  + Add time
                </Button>
              )}
            </div>
          </div>
          <Field label="Instruction">
            {(p) => (
              <input {...p} className="cc-input" value={med.instruction} onChange={(e) => setMed({ ...med, instruction: e.target.value })} placeholder="After food" />
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-sand-200 text-leaf-500 focus:ring-leaf-500"
              checked={med.critical}
              onChange={(e) => setMed({ ...med, critical: e.target.checked })}
            />
            Must not be missed
          </label>
          {saveError && (
            <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
              Not saved — {saveError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddingMed(false)}>Cancel</Button>
            <Button onClick={saveMed} loading={busy} disabled={!med.name.trim() || !med.dose.trim()}>
              Add medicine
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet open={addingTask} title="Add a care task" onClose={() => setAddingTask(false)}>
        <div className="space-y-4">
          <Field label="What should be done?" error={fieldErrors.title_en?.[0]} required>
            {(p) => <input {...p} className="cc-input" value={task.title_en} onChange={(e) => setTask({ ...task, title_en: e.target.value })} />}
          </Field>
          <Field label="Same thing in Hindi" hint="Optional. The attendant screen shows both.">
            {(p) => <input {...p} className="cc-input" value={task.title_hi} onChange={(e) => setTask({ ...task, title_hi: e.target.value })} />}
          </Field>
          <Field label="When">
            {(p) => (
              <select {...p} className="cc-input" value={task.window} onChange={(e) => setTask({ ...task, window: e.target.value })}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="anytime">Any time</option>
              </select>
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-sand-200 text-leaf-500 focus:ring-leaf-500"
              checked={task.critical}
              onChange={(e) => setTask({ ...task, critical: e.target.checked })}
            />
            Important — alert me if it is missed
          </label>
          {saveError && (
            <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
              Not saved — {saveError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddingTask(false)}>Cancel</Button>
            <Button onClick={saveTask} loading={busy} disabled={task.title_en.trim().length < 2}>
              Add task
            </Button>
          </div>
        </div>
      </Sheet>
    </AppShell>
  );
}
