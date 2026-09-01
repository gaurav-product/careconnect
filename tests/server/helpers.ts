import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../../src/server/index.js';
import { getDb, resetDb } from '../../src/server/db.js';

/** Each test file gets its own on-disk database, removed on teardown. */
export function freshApp(name: string) {
  const file = path.resolve(process.cwd(), `data/test-${name}.db`);
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(file + suffix)) fs.unlinkSync(file + suffix);
  }
  process.env.DB_PATH = file;
  process.env.JWT_SECRET = 'test-secret-key';
  resetDb();
  getDb();
  return { app: createApp(), file };
}

export function cleanup(file: string) {
  resetDb();
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(file + suffix)) fs.unlinkSync(file + suffix);
  }
}

export async function signUp(
  app: ReturnType<typeof createApp>,
  opts: { name: string; phone: string; role: 'family' | 'attendant' }
) {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/register')
    .send({ ...opts, password: 'password123' });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${res.text}`);
  return agent;
}

export const samplePlan = {
  patient_name: 'Ramesh Iyer',
  patient_age: 74,
  patient_sex: 'male',
  city: 'New Delhi',
  hospital: 'Max Saket',
  template_id: 'ortho',
  procedure: 'Right hip replacement',
  discharge_date: new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10),
  episode_days: 30,
  medications: [
    { name: 'Rivaroxaban', dose: '10 mg', times: ['09:00'], instruction: 'After food', critical: true },
    { name: 'Paracetamol', dose: '650 mg', times: ['09:00', '21:00'], critical: false }
  ]
};
