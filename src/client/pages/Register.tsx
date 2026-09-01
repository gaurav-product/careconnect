import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AppShell';
import { Button, Card, Field } from '../components/ui';
import { api, RequestError } from '../lib/api';
import { useAuth, type SessionUser } from '../lib/auth';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'family' as 'family' | 'attendant' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const { user } = await api.post<{ user: SessionUser }>('/auth/register', {
        ...form,
        lang: form.role === 'attendant' ? 'hi' : 'en'
      });
      setUser(user);
      navigate(user.role === 'attendant' ? '/join' : '/plans/new', { replace: true });
    } catch (err) {
      const e = err as RequestError;
      setError(e.message);
      setFieldErrors(e.details || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <fieldset className="mt-4">
          <legend className="cc-label">I am…</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: 'family', label: 'A family member', sub: 'I arrange the care' },
                { v: 'attendant', label: 'An attendant', sub: 'I give the care' }
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => set('role')(o.v)}
                aria-pressed={form.role === o.v}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  form.role === o.v ? 'border-leaf-500 bg-leaf-50' : 'border-sand-200 bg-white hover:bg-sand-50'
                }`}
              >
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-xs text-ink-soft">{o.sub}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
          <Field label="Your name" error={fieldErrors.name?.[0]} required>
            {(p) => (
              <input {...p} className="cc-input" value={form.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
            )}
          </Field>
          <Field label="Mobile number" hint="You will sign in with this number." error={fieldErrors.phone?.[0]} required>
            {(p) => (
              <input
                {...p}
                className="cc-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => set('phone')(e.target.value.replace(/\D/g, ''))}
              />
            )}
          </Field>
          <Field label="Password" hint="At least 8 characters." error={fieldErrors.password?.[0]} required>
            {(p) => (
              <input
                {...p}
                className="cc-input"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set('password')(e.target.value)}
              />
            )}
          </Field>
          {error && (
            <p className="rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" block size="lg" loading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-4 rounded-lg bg-sand-50 px-3 py-2 text-xs leading-relaxed text-ink-soft">
          CareConnect stores the care plan you enter and what the attendant records against it. Health information is
          shared only with the people you invite to that plan. This is a portfolio prototype — do not enter a real
          patient's details.
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Already have an account?{' '}
          <Link className="font-medium text-leaf-600 underline" to="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
