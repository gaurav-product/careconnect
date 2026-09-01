import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AppShell';
import { Button, Card, Field } from '../components/ui';
import { api, RequestError } from '../lib/api';

export default function JoinPlan() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ plan_id: string; role: string }>('/invites/accept', { code });
      navigate(res.role === 'attendant' ? '/duty' : `/p/${res.plan_id}`, { replace: true });
    } catch (err) {
      setError((err as RequestError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell lede="The family that hired you will have sent a 6-character code. Enter it once — after that this phone opens straight to today's duty.">
      <Card>
        <h1 className="text-xl font-semibold">
          Join a patient <span className="block text-base font-normal text-ink-soft">मरीज़ से जुड़ें</span>
        </h1>
        <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
          <Field label="Invite code · कोड" required>
            {(p) => (
              <input
                {...p}
                className="cc-input text-center text-2xl font-semibold uppercase tracking-[0.3em]"
                value={code}
                maxLength={6}
                autoCapitalize="characters"
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
              />
            )}
          </Field>
          {error && (
            <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" block size="lg" loading={loading} disabled={code.length !== 6}>
            Join · जुड़ें
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
