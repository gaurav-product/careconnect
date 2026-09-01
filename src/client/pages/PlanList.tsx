import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, EmptyState, ErrorState, Loading } from '../components/ui';
import { useApi } from '../lib/useApi';
import { dateLabel } from '../lib/format';

interface PlanRow {
  id: string;
  patient_name: string;
  procedure: string;
  discharge_date: string;
  episode_days: number;
  status: string;
  city: string;
}

export default function PlanList() {
  const { data, loading, error, reload } = useApi<{ plans: PlanRow[] }>('/plans');

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your care plans</h1>
          <p className="mt-1 text-sm text-ink-muted">Every plan is one recovery episode at home.</p>
        </div>
        <Link to="/plans/new">
          <Button>New plan</Button>
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.plans.length === 0 && (
        <EmptyState
          title="No care plan yet"
          message="Set one up the day your parent is discharged. It takes about five minutes and needs the discharge summary in hand."
          action={
            <Link to="/plans/new">
              <Button size="lg">Set up a care plan</Button>
            </Link>
          }
        />
      )}
      <ul className="space-y-3">
        {data?.plans.map((p) => (
          <li key={p.id}>
            <Link to={`/p/${p.id}`} className="block">
              <Card className="transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{p.patient_name}</h2>
                    <p className="mt-0.5 text-sm text-ink-muted">{p.procedure}</p>
                    <p className="mt-2 text-xs text-ink-soft">
                      {p.city} · discharged {dateLabel(p.discharge_date)} · {p.episode_days}-day plan
                    </p>
                  </div>
                  <Badge tone={p.status === 'active' ? 'good' : 'neutral'}>{p.status}</Badge>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
