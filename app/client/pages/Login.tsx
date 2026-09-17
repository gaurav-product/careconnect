import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AppShell';
import { Button, Card, Field } from '../components/ui';
import { api, RequestError } from '../lib/api';
import { useAuth, type SessionUser } from '../lib/auth';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const { user } = await api.post<{ user: SessionUser }>('/auth/login', { phone, password });
      setUser(user);
      navigate(location.state?.from || (user.role === 'attendant' ? '/duty' : '/plans'), { replace: true });
    } catch (err) {
      const e = err as RequestError;
      setError(e.message);
      setFieldErrors(e.details || {});
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(kind: 'family' | 'attendant') {
    setPhone(kind === 'family' ? '9810012345' : '9810055555');
    setPassword('demo1234');
    setError(null);
  }

  return (
    <AuthShell lede="The daily record of the care your parent actually received — kept by whoever is with them, visible to you wherever you are.">
      <Card>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
          <Field label="Mobile number" error={fieldErrors.phone?.[0]} required>
            {(p) => (
              <input
                {...p}
                className={`cc-input ${fieldErrors.phone ? 'cc-input-error' : ''}`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
              />
            )}
          </Field>
          <Field label="Password" error={fieldErrors.password?.[0]} required>
            {(p) => (
              <input
                {...p}
                className="cc-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          {error && (
            <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" block size="lg" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-sm text-ink-soft">
          New here?{' '}
          <Link className="font-medium text-leaf-600 underline" to="/register">
            Create an account
          </Link>
        </p>
      </Card>

      <div className="mt-4 rounded-2xl border border-dashed border-leaf-300 bg-white/70 p-4">
        <p className="text-sm font-semibold text-ink">Demo logins</p>
        <p className="mt-1 text-sm text-ink-soft">
          This is a portfolio prototype seeded with one fictional episode. No real patient data.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => fillDemo('family')}>
            Family (Ananya)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => fillDemo('attendant')}>
            Attendant (Reena)
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
