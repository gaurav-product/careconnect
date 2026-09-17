/**
 * The attendant screens are bilingual by default. Attendants in Indian home care are
 * usually Hindi-first and read English slowly; the family screens stay in English
 * because that is what the paying user writes in. Both languages are always shown on
 * action labels rather than hidden behind a toggle, so a shared phone works for both.
 */
export type Lang = 'en' | 'hi';

type Dict = Record<string, { en: string; hi: string }>;

export const T: Dict = {
  start_shift: { en: 'Start my shift', hi: 'ड्यूटी शुरू करें' },
  end_shift: { en: 'End shift', hi: 'ड्यूटी खत्म करें' },
  on_duty: { en: 'On duty', hi: 'ड्यूटी पर' },
  day_shift: { en: 'Day shift', hi: 'दिन की ड्यूटी' },
  night_shift: { en: 'Night shift', hi: 'रात की ड्यूटी' },
  medicines: { en: 'Medicines', hi: 'दवाइयाँ' },
  tasks: { en: 'Care tasks', hi: 'देखभाल के काम' },
  readings: { en: 'Readings', hi: 'रीडिंग' },
  done: { en: 'Done', hi: 'हो गया' },
  not_done: { en: 'Could not do', hi: 'नहीं हो पाया' },
  given: { en: 'Given', hi: 'दे दी' },
  not_given: { en: 'Not given', hi: 'नहीं दी' },
  refused: { en: 'Refused', hi: 'मना कर दिया' },
  report_problem: { en: 'Report a problem', hi: 'समस्या बताएं' },
  why: { en: 'What happened?', hi: 'क्या हुआ?' },
  save: { en: 'Save', hi: 'सेव करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  handover_note: { en: 'Note for the next person', hi: 'अगले व्यक्ति के लिए नोट' },
  read_first: { en: 'Read this first', hi: 'पहले यह पढ़ें' },
  warning_signs: { en: 'Warning signs — tell the family at once', hi: 'खतरे के संकेत — तुरंत परिवार को बताएं' },
  patient_today: { en: "Today's care", hi: 'आज की देखभाल' },
  emergency: { en: 'Emergency', hi: 'आपातकाल' },
  all_recorded: { en: 'Everything recorded', hi: 'सब कुछ दर्ज हो गया' },
  pending_items: { en: 'still to record', hi: 'अभी दर्ज करना बाकी' }
};

export const t = (key: string, lang: Lang): string => T[key]?.[lang] ?? key;

/** Both languages together, for action buttons on a shared phone. */
export const bi = (key: string): string => {
  const e = T[key];
  return e ? `${e.en} · ${e.hi}` : key;
};
