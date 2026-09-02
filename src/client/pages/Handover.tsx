import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, ErrorState, Loading, SectionTitle } from '../components/ui';
import { useApi } from '../lib/useApi';
import { dateLabel, timeLabel } from '../lib/format';
import { planNav } from './FamilyDashboard';
import type { Alert, CarePlan, CareTask, Medication, Observation, PlanMember, RedFlag, VitalCheck } from '../../shared/types';

interface Pack {
  plan: CarePlan;
  medications: Medication[];
  tasks: CareTask[];
  vitals: VitalCheck[];
  red_flags: RedFlag[];
  open_alerts: Alert[];
  recent_decisions: Array<{ id: string; title: string; detail: string; severity: string; resolution_note: string; resolved_at: string }>;
  recent_observations: Array<Observation & { red_flag_label: string | null }>;
  outgoing_attendant: PlanMember | null;
  last_handover_note: { handover_note: string; date: string; slot: string } | null;
  week: Array<{ date: string; day_number: number; logged: number; expected: number; documented: boolean; missed_critical: number }>;
  recent_problems: string[];
}

export default function HandoverPage() {
  const { planId = '' } = useParams();
  const { data, loading, error, reload } = useApi<Pack>(`/plans/${planId}/handover`);

  if (loading) return <AppShell nav={planNav(planId)}><Loading label="Building the handover pack…" /></AppShell>;
  if (error || !data)
    return (
      <AppShell nav={planNav(planId)}>
        <ErrorState message={error ?? 'The handover pack could not be built.'} onRetry={reload} />
      </AppShell>
    );

  return (
    <AppShell nav={planNav(planId)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 print:block">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Handover pack</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Everything a new attendant needs on their first shift, on one page. This is what usually walks out of the
            house when an attendant leaves — here it stays with the patient.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
          Print / save as PDF
        </Button>
      </div>

      <Card className="mb-4">
        <SectionTitle>The patient</SectionTitle>
        <p className="text-lg font-semibold">
          {data.plan.patient_name}, {data.plan.patient_age}
        </p>
        <p className="text-sm text-ink-muted">{data.plan.procedure}</p>
        <p className="mt-1 text-sm text-ink-soft">
          Discharged {dateLabel(data.plan.discharge_date)} from {data.plan.hospital || 'hospital'} · {data.plan.city}
        </p>
        {data.plan.notes && <p className="mt-3 rounded-lg bg-sand-50 px-3 py-2 text-sm">{data.plan.notes}</p>}
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {data.plan.doctor_name && (
            <div>
              <dt className="text-ink-soft">Doctor</dt>
              <dd className="font-medium">
                {data.plan.doctor_name} {data.plan.doctor_phone && `· ${data.plan.doctor_phone}`}
              </dd>
            </div>
          )}
          {data.plan.emergency_contact_name && (
            <div>
              <dt className="text-ink-soft">Emergency contact</dt>
              <dd className="font-medium">
                {data.plan.emergency_contact_name} {data.plan.emergency_contact_phone && `· ${data.plan.emergency_contact_phone}`}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      <Card className="mb-4 border-alert-100 bg-alert-50/50">
        <SectionTitle>Warning signs — call the family at once</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.red_flags.map((f) => (
            <li key={f.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${f.severity === 'urgent' ? 'bg-alert-500' : 'bg-warn-600'}`} />
              <span>
                <span className="font-medium">{f.label_en}</span>
                <span className="block text-ink-muted">{f.label_hi}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <SectionTitle>Medicines</SectionTitle>
        <ul className="divide-y divide-sand-100">
          {data.medications.map((m) => (
            <li key={m.id} className="py-2.5">
              <p className="font-medium">
                {m.name} <span className="font-normal text-ink-soft">{m.dose}</span>
                {m.critical && <Badge tone="alert" className="ml-2">must not be missed</Badge>}
              </p>
              <p className="text-sm text-ink-muted">
                {m.times.map(timeLabel).join(' · ')}
                {m.instruction && ` — ${m.instruction}`}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <SectionTitle>The daily routine</SectionTitle>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {data.tasks.map((t) => (
            <li key={t.id} className="text-sm">
              <span className="font-medium">{t.title_en}</span>
              {t.critical && <span className="ml-1 text-alert-500">•</span>}
              <span className="block text-ink-soft">
                {t.title_hi} · {t.window}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <SectionTitle>How the last week went</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {data.week.map((d) => (
            <li
              key={d.date}
              className={`rounded-xl border px-3 py-2 text-sm ${
                d.documented ? 'border-leaf-300 bg-leaf-50' : d.missed_critical ? 'border-alert-100 bg-alert-50' : 'border-sand-200'
              }`}
            >
              <span className="block font-medium">Day {d.day_number}</span>
              <span className="text-ink-soft">
                {d.logged}/{d.expected} recorded
              </span>
            </li>
          ))}
        </ul>
        {data.recent_problems.length > 0 && (
          <>
            <p className="mt-4 text-sm font-medium">What went wrong recently</p>
            <ul className="mt-1.5 space-y-1 text-sm text-ink-muted">
              {data.recent_problems.map((p, i) => (
                <li key={i}>• {p}</li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {(data.recent_observations.length > 0 || data.recent_decisions.length > 0) && (
        <Card className="mb-4">
          <SectionTitle>What has been reported, and what the family decided</SectionTitle>
          {data.recent_decisions.length > 0 && (
            <ul className="space-y-3">
              {data.recent_decisions.map((d) => (
                <li key={d.id} className="rounded-xl border border-sand-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={d.severity === 'urgent' ? 'alert' : 'warn'}>settled</Badge>
                    <span className="text-sm font-medium">{d.title}</span>
                    <span className="ml-auto text-xs text-ink-soft">{dateLabel(d.resolved_at.slice(0, 10))}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-muted">{d.detail}</p>
                  <p className="mt-2 rounded-lg bg-leaf-50 px-3 py-2 text-sm">
                    <span className="font-medium">Family decided:</span> {d.resolution_note}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {data.recent_observations.length > 0 && (
            <>
              <p className="mt-4 text-sm font-medium">Recent notes from the attendants</p>
              <ul className="mt-1.5 space-y-2">
                {data.recent_observations.map((o) => (
                  <li key={o.id} className="text-sm text-ink-muted">
                    <span className="font-medium text-ink">{o.red_flag_label ?? 'Note'}:</span> {o.note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}

      {data.last_handover_note && (
        <Card className="mb-4">
          <SectionTitle>Last note left by the outgoing attendant</SectionTitle>
          <p className="text-sm text-ink-muted">“{data.last_handover_note.handover_note}”</p>
          <p className="mt-1 text-xs text-ink-soft">
            {dateLabel(data.last_handover_note.date)} · {data.last_handover_note.slot} shift
          </p>
        </Card>
      )}

      {data.open_alerts.length > 0 && (
        <Card>
          <SectionTitle>Still open</SectionTitle>
          <ul className="space-y-2">
            {data.open_alerts.map((a) => (
              <li key={a.id} className="text-sm">
                <Badge tone={a.severity === 'urgent' ? 'alert' : 'warn'}>{a.severity}</Badge>{' '}
                <span className="font-medium">{a.title}</span>
                <span className="block text-ink-muted">{a.detail}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
