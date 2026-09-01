import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-leaf-500 text-white" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && <span className="text-[17px] font-semibold tracking-tight">CareConnect</span>}
    </span>
  );
}

export function AppShell({
  children,
  nav,
  title
}: {
  children: React.ReactNode;
  nav?: Array<{ to: string; label: string; end?: boolean }>;
  title?: string;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-card"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          {title && <p className="hidden truncate text-sm text-ink-muted sm:block">{title}</p>}
          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-ink-muted sm:inline">{user.name}</span>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-sand-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
        {nav && nav.length > 0 && (
          <nav aria-label="Care plan sections" className="mx-auto max-w-4xl overflow-x-auto px-2">
            <ul className="flex gap-1 pb-1">
              {nav.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-white text-leaf-700 shadow-card' : 'text-ink-muted hover:bg-sand-100'
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main id="main" className="mx-auto max-w-4xl px-4 pb-24 pt-5">
        {children}
      </main>
    </div>
  );
}

export function AuthShell({ children, lede }: { children: React.ReactNode; lede?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-50 to-sand-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <Link to="/" className="mb-6 inline-flex">
          <Logo />
        </Link>
        {lede && <p className="mb-6 text-[15px] leading-relaxed text-ink-muted">{lede}</p>}
        {children}
      </div>
    </div>
  );
}
