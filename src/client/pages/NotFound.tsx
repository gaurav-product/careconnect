import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AppShell';
import { Card } from '../components/ui';

export default function NotFound() {
  return (
    <AuthShell>
      <Card>
        <h1 className="text-xl font-semibold">That page does not exist</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The link may be out of date. Go back to{' '}
          <Link to="/" className="font-medium text-leaf-600 underline">
            your care plans
          </Link>
          .
        </p>
      </Card>
    </AuthShell>
  );
}
