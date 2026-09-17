import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Card, ErrorState, Loading, SectionTitle } from '../components/ui';
import { useApi } from '../lib/useApi';
import { clockTime, dateLabel, readingValue, timeLabel } from '../lib/format';
import { planNav } from './FamilyDashboard';
import { VITAL_META, type DayRecord } from '../../shared/types';

const statusTone: Record<string, 'good' | 'alert' | 'neutral' | 'warn'> = {
  given: 'good',
  done: 'good',
  missed: 'alert',
  refused: 'alert',
  held_on_advice: 'warn',
  not_applicable: 'neutral',
  pending: 'neutral'
};

const statusLabel: Record<string, string> = {
  given: 'given',
  done: 'done',
  missed: 'missed',
  refused: 'refused',
  held_on_advice: 'held on advice',
  not_applicable: 'not needed',
  pending: 'not recorded'
};

export default function DayRecordPage() {
  const { planId = '', date = '' } = useParams();
  const { data, loading, error, reload } = useApi<DayRecord & { documented: boolean; complete: boolean }>(
    `/plans/${planId}/days/${date}`
  );

  if (loading) return <AppShell nav={planNav(planId)}><Loading /></AppShell>;
  if (error || !data)
    return (
      <AppShell nav={planNav(planId)}>
        <ErrorState message={error ?? 'That day could not be opened.'} onRetry={reload} />
      </AppShell>
    );

  return (
    <AppShell nav={planNav(planId)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to={`/p/${planId}`} className="text-sm font-medium text-leaf-600 underline">
            ← Back to today
          </Link>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            Day {data.day_number} · {dateLabel(data.date)}
          </h1>
        </div>
        <Badge tone={data.complete ? 'good' : data.documented ? 'warn' : 'neutral'}>
          {data.complete ? 'Record complete' : data.documented ? 'Something important missed' : 'Nothing recorded'}
        </Badge>
      </div>

      <Card className="mb-4">
        <SectionTitle>Who was on duty</SectionTitle>
        {data.shifts.length === 0 ? (
          <p className="text-sm text-ink-soft">No shift was started on this day.</p>
        ) : (
          <ul className="space-y-3">
            {data.shifts.map((s) => (
              <li key={s.id} className="rounded-xl border border-sand-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {s.attendant_name} · {s.slot === 'day' ? 'day shift' : 'night shift'}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {clockTime(s.started_at)} – {s.ended_at ? clockTime(s.ended_at) : 'still on duty'}
                  </p>
                </div>
                {s.handover_note && (
                  <p className="mt-2 rounded-lg bg-sand-50 px-3 py-2 text-sm text-ink-muted">“{s.handover_note}”</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-4">
        <SectionTitle>Medicines</SectionTitle>
        <ul className="divide-y divide-sand-100">
          {data.meds.map((m) => (
            <li key={`${m.medication_id}${m.scheduled_time}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium">
                  {m.name} <span className="font-normal text-ink-soft">{m.dose}</span>
                  {m.critical && <span className="ml-1.5 text-alert-500" title="Must not be missed">•</span>}
                </p>
                <p className="text-sm text-ink-soft">
                  scheduled {timeLabel(m.scheduled_time)}
                  {m.logged_at && ` · recorded ${clockTime(m.logged_at)}`}
                </p>
                {m.reason && <p className="mt-0.5 text-sm text-alert-600">“{m.reason}”</p>}
              </div>
              <Badge tone={statusTone[m.status]}>{statusLabel[m.status]}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <SectionTitle>Care tasks</SectionTitle>
        <ul className="divide-y divide-sand-100">
          {data.tasks.map((t) => (
            <li key={t.task_id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium">
                  {t.title_en}
                  {t.critical && <span className="ml-1.5 text-alert-500" title="Important">•</span>}
                </p>
                <p className="text-sm text-ink-soft">{t.window}</p>
                {t.reason && <p className="mt-0.5 text-sm text-alert-600">“{t.reason}”</p>}
              </div>
              <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      {data.vitals.length > 0 && (
        <Card className="mb-4">
          <SectionTitle>Readings</SectionTitle>
          <ul className="flex flex-wrap gap-3">
            {data.vitals.map((v) => (
              <li
                key={v.id}
                className={`rounded-xl border px-4 py-3 ${v.out_of_range ? 'border-alert-100 bg-alert-50' : 'border-sand-200'}`}
              >
                <p className="text-xs text-ink-soft">{VITAL_META[v.type]?.label ?? v.type}</p>
                <p className="text-lg font-semibold">
                  {readingValue(v.value1)}
                  {v.value2 ? `/${readingValue(v.value2)}` : ''} <span className="text-sm font-normal text-ink-soft">{VITAL_META[v.type]?.unit}</span>
                </p>
                <p className="text-xs text-ink-soft">{clockTime(v.logged_at)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.revisions.length > 0 && (
        <Card className="mb-4">
          <SectionTitle>Corrections during the day</SectionTitle>
          <p className="mb-3 text-sm text-ink-soft">
            An entry can be changed while the shift is open — a wrong button, or a dose given later than planned.
            The earlier value is kept, so the record cannot be tidied up after the fact.
          </p>
          <ul className="space-y-2">
            {data.revisions.map((r) => (
              <li key={r.id} className="rounded-xl border border-sand-200 p-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-xs text-ink-soft">
                    {clockTime(r.changed_at)}
                    {r.changed_by_name && ` · ${r.changed_by_name}`}
                  </span>
                </div>
                <p className="mt-1 text-ink-muted">
                  <span className="line-through decoration-alert-500">
                    {statusLabel[r.previous_status] ?? r.previous_status}
                    {r.previous_reason && ` — “${r.previous_reason}”`}
                  </span>
                  <span aria-hidden="true"> → </span>
                  <span className="font-medium text-ink">
                    {statusLabel[r.new_status] ?? r.new_status}
                    {r.new_reason && ` — “${r.new_reason}”`}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.observations.length > 0 && (
        <Card className="mb-4">
          <SectionTitle>What was reported</SectionTitle>
          <ul className="space-y-3">
            {data.observations.map((o) => (
              <li key={o.id} className="rounded-xl border border-sand-200 p-3">
                <div className="flex items-center gap-2">
                  <Badge tone={o.severity === 'urgent' ? 'alert' : 'warn'}>{o.severity === 'urgent' ? 'urgent' : 'watch'}</Badge>
                  {o.red_flag_label && <span className="text-sm font-medium">{o.red_flag_label}</span>}
                  <span className="ml-auto text-xs text-ink-soft">{clockTime(o.logged_at)}</span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">{o.note}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
