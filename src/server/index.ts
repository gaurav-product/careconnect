import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getDb } from './db.js';
import { HttpError } from './errors.js';
import { authRouter } from './routes/auth.js';
import { planRouter } from './routes/plans.js';
import { careRouter } from './routes/care.js';
import { familyRouter } from './routes/family.js';
import { requireAuth, type AuthedRequest } from './auth.js';
import { track } from './services/events.js';
import { z } from 'zod';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  // Conservative security headers. A CDN/proxy would normally own these in production.
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'careconnect', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/plans', planRouter);
  app.use('/api', careRouter);
  app.use('/api', familyRouter);

  // Client-side analytics sink.
  app.post('/api/events', requireAuth, (req: AuthedRequest, res) => {
    const parsed = z
      .object({
        name: z.string().min(2).max(60),
        plan_id: z.string().max(40).nullish(),
        props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
      })
      .safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Bad event payload.');
    track({
      name: parsed.data.name,
      userId: req.userId,
      planId: parsed.data.plan_id ?? null,
      role: req.userRole,
      props: parsed.data.props
    });
    res.status(202).json({ ok: true });
  });

  const clientDir = path.resolve(process.cwd(), 'dist/client');
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDir, 'index.html')));
  }

  app.use((_req, res) => res.status(404).json({ error: 'not_found', message: 'That endpoint does not exist.' }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.code, message: err.message, details: err.details });
    }
    console.error('[careconnect] unhandled error', err);
    res.status(500).json({ error: 'server_error', message: 'Something went wrong on our side. Please try again.' });
  });

  return app;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  getDb();
  const port = Number(process.env.PORT || 4000);
  createApp().listen(port, () => console.log(`[careconnect] api listening on http://localhost:${port}`));
}
