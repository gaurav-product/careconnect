import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, Field, SectionTitle } from '../components/ui';
import { api, RequestError } from '../lib/api';
import { useApi } from '../lib/useApi';
import { trackEvent } from '../lib/analytics';

interface Template {
  id: string;
  label: string;
  description: string;
  task_count: number;
  red_flag_count: number;
  vitals: string[];
}

interface MedRow {
  name: string;
  dose: string;
  times: string[];
  instruction: string;
  critical: boolean;
}

const todayIso = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

const emptyMed = (): MedRow => ({ name: '', dose: '', times: ['09:00'], instruction: '', critical: false });

export default function CreatePlan() {
  const navigate = useNavigate();
  const { data: templates } = useApi<{ templates: Template[] }>('/plans/templates');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [patient, setPatient] = useState({
    patient_name: '',
    patient_age: '',
    patient_sex: 'male' as 'male' | 'female' | 'other',
    city: '',
    hospital: '',
    procedure: '',
    discharge_date: todayIso(),
    episode_days: 30,
    doctor_name: '',
    doctor_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  });
  const [templateId, setTemplateId] = useState('ortho');
  const [meds, setMeds] = useState<MedRow[]>([emptyMed()]);

  const set = (k: keyof typeof patient) => (v: string | number) => setPatient((p) => ({ ...p, [k]: v }));

  const step1Valid =
    patient.patient_name.trim().length >= 2 &&
    Number(patient.patient_age) > 0 &&
    patient.city.trim().length >= 2 &&
    patient.procedure.trim().length >= 2;

  async function submit() {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const cleanMeds = meds
      .filter((m) => m.name.trim() && m.dose.trim())
      .map((m) => ({
        name: m.name.trim(),
        dose: m.dose.trim(),
        times: m.times,
        instruction: m.instruction.trim() || null,
        critical: m.critical
      }));
    try {
      const res = await api.post<{ plan_id: string }>('/plans', {
        ...patient,
        patient_age: Number(patient.patient_age),
        episode_days: Number(patient.episode_days),
        template_id: templateId,
        hospital: patient.hospital.trim() || null,
        doctor_name: patient.doctor_name.trim() || null,
        doctor_phone: patient.doctor_phone.trim() || null,
        emergency_contact_name: patient.emergency_contact_name.trim() || null,
        emergency_contact_phone: patient.emergency_contact_phone.trim() || null,
        notes: patient.notes.trim() || null,
        medications: cleanMeds
      });
      trackEvent('care_plan_setup_completed', res.plan_id, { medications: cleanMeds.length, template: templateId });
      navigate(`/p/${res.plan_id}/team?new=1`, { replace: true });
    } catch (err) {
      const e = err as RequestError;
      setError(e.message);
      setFieldErrors(e.details || {});
      setStep(1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="New care plan">
      <ol className="mb-5 flex gap-2 text-xs font-medium" aria-label="Setup progress">
        {['Patient & discharge', 'Recovery type', 'Medicines'].map((label, i) => (
          <li
            key={label}
            aria-current={step === i + 1 ? 'step' : undefined}
            className={`flex-1 rounded-lg px-3 py-2 ${
              step === i + 1 ? 'bg-leaf-500 text-white' : step > i + 1 ? 'bg-leaf-100 text-leaf-700' : 'bg-sand-100 text-ink-soft'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mb-4 rounded-lg bg-alert-50 px-3 py-2 text-sm text-alert-600" role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <Card>
          <SectionTitle>Who is coming home, and from where?</SectionTitle>
          <p className="mb-4 text-sm text-ink-soft">
            Keep the discharge summary in front of you. Everything here comes off that sheet.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Patient's name" error={fieldErrors.patient_name?.[0]} required>
              {(p) => <input {...p} className="cc-input" value={patient.patient_name} onChange={(e) => set('patient_name')(e.target.value)} />}
            </Field>
            <Field label="Age" error={fieldErrors.patient_age?.[0]} required>
              {(p) => (
                <input
                  {...p}
                  className="cc-input"
                  inputMode="numeric"
                  maxLength={3}
                  value={patient.patient_age}
                  onChange={(e) => set('patient_age')(e.target.value.replace(/\D/g, ''))}
                />
              )}
            </Field>
            <Field label="Sex">
              {(p) => (
                <select {...p} className="cc-input" value={patient.patient_sex} onChange={(e) => set('patient_sex')(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              )}
            </Field>
            <Field label="City they are recovering in" error={fieldErrors.city?.[0]} required>
              {(p) => <input {...p} className="cc-input" value={patient.city} onChange={(e) => set('city')(e.target.value)} placeholder="e.g. New Delhi" />}
            </Field>
            <Field label="Hospital">
              {(p) => <input {...p} className="cc-input" value={patient.hospital} onChange={(e) => set('hospital')(e.target.value)} />}
            </Field>
            <Field label="Discharge date" hint="Day 1 of the plan." error={fieldErrors.discharge_date?.[0]} required>
              {(p) => (
                <input
                  {...p}
                  className="cc-input"
                  type="date"
                  max={todayIso()}
                  value={patient.discharge_date}
                  onChange={(e) => set('discharge_date')(e.target.value)}
                />
              )}
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="Surgery or condition"
              hint="Copy the line from the discharge summary."
              error={fieldErrors.procedure?.[0]}
              required
            >
              {(p) => <input {...p} className="cc-input" value={patient.procedure} onChange={(e) => set('procedure')(e.target.value)} />}
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Treating doctor">
              {(p) => <input {...p} className="cc-input" value={patient.doctor_name} onChange={(e) => set('doctor_name')(e.target.value)} />}
            </Field>
            <Field label="Doctor's number">
              {(p) => (
                <input {...p} className="cc-input" inputMode="numeric" maxLength={10} value={patient.doctor_phone} onChange={(e) => set('doctor_phone')(e.target.value.replace(/\D/g, ''))} />
              )}
            </Field>
            <Field label="Local emergency contact" hint="Someone who can reach the house in 20 minutes.">
              {(p) => (
                <input {...p} className="cc-input" value={patient.emergency_contact_name} onChange={(e) => set('emergency_contact_name')(e.target.value)} />
              )}
            </Field>
            <Field label="Their number">
              {(p) => (
                <input
                  {...p}
                  className="cc-input"
                  inputMode="numeric"
                  maxLength={10}
                  value={patient.emergency_contact_phone}
                  onChange={(e) => set('emergency_contact_phone')(e.target.value.replace(/\D/g, ''))}
                />
              )}
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Anything the attendant must know" hint="Room layout, hearing aid, temper, sleep habits — the things only you know.">
              {(p) => (
                <textarea {...p} className="cc-input min-h-[80px]" value={patient.notes} onChange={(e) => set('notes')(e.target.value)} maxLength={1000} />
              )}
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button size="lg" disabled={!step1Valid} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <SectionTitle>What kind of recovery is this?</SectionTitle>
          <p className="mb-4 text-sm text-ink-soft">
            This only decides the starting checklist and warning signs. You can edit every line afterwards — and you
            should, against your own discharge sheet.
          </p>
          <ul className="space-y-2">
            {templates?.templates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  aria-pressed={templateId === t.id}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    templateId === t.id ? 'border-leaf-500 bg-leaf-50' : 'border-sand-200 bg-white hover:bg-sand-50'
                  }`}
                >
                  <span className="block font-semibold">{t.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{t.description}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="info">{t.task_count} daily tasks</Badge>
                    <Badge tone="warn">{t.red_flag_count} warning signs</Badge>
                    {t.vitals.map((v) => (
                      <Badge key={v}>{v.toUpperCase()}</Badge>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <SectionTitle>Medicines from the discharge sheet</SectionTitle>
          <p className="mb-4 text-sm text-ink-soft">
            Mark a medicine <strong>must not be missed</strong> if skipping it is dangerous — blood thinners,
            antibiotics, heart medicines. Those raise an urgent alert the moment they are not recorded.
          </p>
          <ul className="space-y-3">
            {meds.map((m, i) => (
              <li key={i} className="rounded-xl border border-sand-200 p-3">
                <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
                  <Field label="Medicine">
                    {(p) => (
                      <input
                        {...p}
                        className="cc-input"
                        value={m.name}
                        placeholder="e.g. Rivaroxaban"
                        onChange={(e) => setMeds((list) => list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      />
                    )}
                  </Field>
                  <Field label="Dose">
                    {(p) => (
                      <input
                        {...p}
                        className="cc-input"
                        value={m.dose}
                        placeholder="10 mg"
                        onChange={(e) => setMeds((list) => list.map((x, j) => (j === i ? { ...x, dose: e.target.value } : x)))}
                      />
                    )}
                  </Field>
                </div>
                <div className="mt-3">
                  <span className="cc-label">Times</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {m.times.map((time, ti) => (
                      <span key={ti} className="flex items-center gap-1">
                        <input
                          className="cc-input w-32"
                          type="time"
                          aria-label={`Dose time ${ti + 1} for ${m.name || 'this medicine'}`}
                          value={time}
                          onChange={(e) =>
                            setMeds((list) =>
                              list.map((x, j) => (j === i ? { ...x, times: x.times.map((t, k) => (k === ti ? e.target.value : t)) } : x))
                            )
                          }
                        />
                        {m.times.length > 1 && (
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-ink-soft hover:bg-sand-100"
                            aria-label={`Remove dose time ${ti + 1}`}
                            onClick={() =>
                              setMeds((list) => list.map((x, j) => (j === i ? { ...x, times: x.times.filter((_, k) => k !== ti) } : x)))
                            }
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                    {m.times.length < 6 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => setMeds((list) => list.map((x, j) => (j === i ? { ...x, times: [...x.times, '21:00'] } : x)))}
                      >
                        + Add time
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-sand-200 text-leaf-500 focus:ring-leaf-500"
                      checked={m.critical}
                      onChange={(e) => setMeds((list) => list.map((x, j) => (j === i ? { ...x, critical: e.target.checked } : x)))}
                    />
                    Must not be missed
                  </label>
                  {meds.length > 1 && (
                    <Button size="sm" variant="ghost" type="button" onClick={() => setMeds((list) => list.filter((_, j) => j !== i))}>
                      Remove medicine
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-3" type="button" onClick={() => setMeds((l) => [...l, emptyMed()])}>
            + Add another medicine
          </Button>
          <div className="mt-5 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button size="lg" loading={saving} onClick={submit}>
              Create care plan
            </Button>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
