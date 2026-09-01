import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, ErrorState, Loading, SectionTitle, Sparkline } from '../components/ui';
import { useApi } from '../lib/useApi';
import { timeAgo } from '../lib/format';
import { planNav } from './FamilyDashboard';

interface Metrics {
  days_elapsed: number;
  verified_care_days: number;
  verified_rate: number;
  logging_completeness: number;
  missed_critical_items: number;
  shifts_started: number;
  shift_close_rate: number;
  handover_note_rate: number;
  alerts_total: number;
  alerts_open: number;
  urgent_alerts: number;
  median_minutes_to_acknowledge: number | null;
  trend: Array<{ date: string; day_number: number; logged: number; expected: number; verified: boolean }>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-sand-200 bg-white p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

interface Outbox {
  notifications: Array<{
    id: string;
    channel: string;
    to_name: string | null;
    to_phone: string | null;
    message: string;
    status: string;
    created_at: string;
  }>;
  delivery_connected: boolean;
}

export default function InsightsPage() {
  const { planId = '' } = useParams();
  const { data, loading, error, reload } = useApi<Metrics>(`/plans/${planId}/metrics`);
  const { data: outbox } = useApi<Outbox>(`/plans/${planId}/notifications`);

  if (loading) return <AppShell nav={planNav(planId)}><Loading /></AppShell>;
  if (error || !data)
    return (
      <AppShell nav={planNav(planId)}>
        <ErrorState message={error ?? 'Insights could not be calculated.'} onRetry={reload} />
      </AppShell>
    );

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <AppShell nav={planNav(planId)}>
      <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
      <p className="mb-5 mt-1 max-w-2xl text-sm text-ink-muted">
        These are the product's measurement definitions computed over this one episode. They describe the seeded demo
        plan — they are not evidence of real-world performance, and no CareConnect product has been tested with real
        users yet.
      </p>

      <Card className="mb-4">
        <SectionTitle>North star — verified care days</SectionTitle>
        <p className="mb-3 text-sm text-ink-muted">
          A day counts once every must-not-miss medicine and task was recorded, at least 80% of the day's items were
          recorded, and no urgent alert was left open overnight.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Verified care days" value={`${data.verified_care_days} of ${data.days_elapsed}`} sub={pct(data.verified_rate)} />
          <Stat label="Record completeness" value={pct(data.logging_completeness)} sub="items recorded ÷ items expected" />
          <Stat label="Missed critical items" value={String(data.missed_critical_items)} sub="lower is better" />
        </div>
        <div className="mt-4 text-leaf-500">
          <Sparkline points={data.trend.map((t) => (t.expected ? t.logged / t.expected : 0))} />
          <p className="mt-1 text-xs text-ink-soft">Share of expected items recorded, by day</p>
        </div>
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card>
          <SectionTitle>Attendant behaviour</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Shifts started" value={String(data.shifts_started)} />
            <Stat label="Shifts closed properly" value={pct(data.shift_close_rate)} />
            <Stat label="Shifts with a handover note" value={pct(data.handover_note_rate)} />
          </div>
        </Card>
        <Card>
          <SectionTitle>Escalation</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Alerts raised" value={String(data.alerts_total)} sub={`${data.urgent_alerts} urgent`} />
            <Stat label="Still open" value={String(data.alerts_open)} />
            <Stat
              label="Median time to acknowledge"
              value={data.median_minutes_to_acknowledge === null ? '—' : `${data.median_minutes_to_acknowledge} min`}
              sub="family sees it after…"
            />
          </div>
        </Card>
      </div>

      {outbox && (
        <Card className="mb-4 border-warn-100 bg-warn-50/50">
          <SectionTitle>Notification outbox — not connected</SectionTitle>
          <p className="mb-3 text-sm text-ink-muted">
            Every alert also writes the WhatsApp or SMS message a live deployment would push to you. In this prototype
            nothing is actually sent: you see alerts when you open CareConnect. The outbox is shown rather than hidden so
            the gap is obvious.
          </p>
          {outbox.notifications.length === 0 ? (
            <p className="text-sm text-ink-soft">No messages queued yet.</p>
          ) : (
            <ul className="space-y-2">
              {outbox.notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="rounded-xl border border-sand-200 bg-white p-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-ink-soft">
                    {n.channel} → {n.to_name ?? 'family'} {n.to_phone ? `(${n.to_phone})` : ''} · {timeAgo(n.created_at)} ·{' '}
                    {n.status.replace('_', ' ')}
                  </p>
                  <p className="mt-1 text-ink-muted">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle>Day by day</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Items recorded each day of the episode</caption>
            <thead>
              <tr className="border-b border-sand-200 text-left text-ink-soft">
                <th scope="col" className="py-2 pr-4 font-medium">Day</th>
                <th scope="col" className="py-2 pr-4 font-medium">Date</th>
                <th scope="col" className="py-2 pr-4 font-medium">Recorded</th>
                <th scope="col" className="py-2 font-medium">Verified</th>
              </tr>
            </thead>
            <tbody>
              {data.trend.map((t) => (
                <tr key={t.date} className="border-b border-sand-100 last:border-0">
                  <td className="py-2 pr-4">{t.day_number}</td>
                  <td className="py-2 pr-4 text-ink-soft">{t.date}</td>
                  <td className="py-2 pr-4">
                    {t.logged}/{t.expected}
                  </td>
                  <td className="py-2">{t.verified ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
