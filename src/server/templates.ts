import type { AlertSeverity, TaskCategory, TaskWindow, VitalType } from '../shared/types.js';

/**
 * Discharge-type starter plans.
 *
 * These encode the routine, non-diagnostic parts of a standard discharge instruction
 * sheet (mobilisation, wound checks, hydration, warning signs to escalate). They are a
 * STARTING POINT the family edits against their own discharge summary — CareConnect
 * never generates a clinical plan on its own. See docs/12-design-decisions.md (D-07).
 */

export interface TemplateTask {
  title_en: string;
  title_hi: string;
  window: TaskWindow;
  category: TaskCategory;
  critical?: boolean;
}
export interface TemplateFlag {
  label_en: string;
  label_hi: string;
  severity: AlertSeverity;
}
export interface TemplateVital {
  type: VitalType;
  times: string[];
  low?: number | null;
  high?: number | null;
  low2?: number | null;
  high2?: number | null;
}
export interface CareTemplate {
  id: string;
  label: string;
  description: string;
  tasks: TemplateTask[];
  vitals: TemplateVital[];
  red_flags: TemplateFlag[];
}

const COMMON_FLAGS: TemplateFlag[] = [
  { label_en: 'Fever above 101°F', label_hi: '101°F से ज़्यादा बुखार', severity: 'urgent' },
  { label_en: 'Breathlessness or chest pain', label_hi: 'साँस फूलना या सीने में दर्द', severity: 'urgent' },
  { label_en: 'Confusion or unusual drowsiness', label_hi: 'भ्रम या असामान्य नींद', severity: 'urgent' },
  { label_en: 'A fall', label_hi: 'गिर जाना', severity: 'urgent' },
  { label_en: 'Not eating or drinking all day', label_hi: 'पूरे दिन खाना-पानी न लेना', severity: 'watch' },
  { label_en: 'Refusing medicines', label_hi: 'दवा लेने से मना करना', severity: 'watch' }
];

const COMMON_TASKS: TemplateTask[] = [
  { title_en: 'Morning sponge / bath and change of clothes', title_hi: 'सुबह स्पंज/स्नान और कपड़े बदलना', window: 'morning', category: 'hygiene' },
  { title_en: 'Breakfast eaten (note how much)', title_hi: 'नाश्ता कराया (कितना खाया लिखें)', window: 'morning', category: 'nutrition' },
  { title_en: 'Lunch eaten (note how much)', title_hi: 'दोपहर का खाना (कितना खाया लिखें)', window: 'afternoon', category: 'nutrition' },
  { title_en: 'Dinner eaten (note how much)', title_hi: 'रात का खाना (कितना खाया लिखें)', window: 'evening', category: 'nutrition' },
  { title_en: 'Water intake through the day', title_hi: 'दिनभर पानी पिलाना', window: 'anytime', category: 'nutrition' },
  { title_en: 'Passed urine / stool noted', title_hi: 'पेशाब / शौच की जानकारी लिखी', window: 'anytime', category: 'observation' },
  { title_en: 'Night settle: light off, water and bell within reach', title_hi: 'रात को सुलाना: बत्ती बंद, पानी और घंटी पास में', window: 'night', category: 'other' }
];

export const TEMPLATES: CareTemplate[] = [
  {
    id: 'ortho',
    label: 'Hip / knee replacement or fracture',
    description: 'Mobilisation, wound care and clot-risk watch after orthopaedic surgery.',
    tasks: [
      ...COMMON_TASKS,
      { title_en: 'Assisted walking with walker (as advised)', title_hi: 'वॉकर के सहारे चलवाना (सलाह अनुसार)', window: 'morning', category: 'mobility', critical: true },
      { title_en: 'Second walk / standing session', title_hi: 'दूसरी बार चलना/खड़ा करना', window: 'evening', category: 'mobility' },
      { title_en: 'Prescribed physiotherapy exercises', title_hi: 'बताई गई फिजियोथेरेपी एक्सरसाइज़', window: 'afternoon', category: 'exercise', critical: true },
      { title_en: 'Check wound dressing — dry, clean, no smell', title_hi: 'घाव की पट्टी देखें — सूखी, साफ़, बदबू नहीं', window: 'morning', category: 'wound', critical: true },
      { title_en: 'Check for swelling or pain in the calf', title_hi: 'पिंडली में सूजन या दर्द देखें', window: 'evening', category: 'observation', critical: true },
      { title_en: 'Change position / prevent bed sores', title_hi: 'करवट बदलवाना / बेडसोर से बचाव', window: 'anytime', category: 'mobility' }
    ],
    vitals: [
      { type: 'temp', times: ['09:00', '21:00'], low: 96, high: 100.4 },
      { type: 'bp', times: ['09:00'], low: 90, high: 150, low2: 60, high2: 95 }
    ],
    red_flags: [
      ...COMMON_FLAGS,
      { label_en: 'Wound is red, warm, bleeding or leaking', label_hi: 'घाव लाल, गरम, खून या पानी रिस रहा है', severity: 'urgent' },
      { label_en: 'Calf swelling or sudden leg pain', label_hi: 'पिंडली में सूजन या अचानक दर्द', severity: 'urgent' },
      { label_en: 'Cannot bear weight / new inability to stand', label_hi: 'खड़ा नहीं हो पा रहे', severity: 'urgent' }
    ]
  },
  {
    id: 'cardiac',
    label: 'Cardiac — angioplasty, bypass or heart failure',
    description: 'Fluid, salt and blood-pressure discipline with strict medicine timing.',
    tasks: [
      ...COMMON_TASKS,
      { title_en: 'Weigh the patient at the same time daily', title_hi: 'रोज़ एक ही समय वज़न लें', window: 'morning', category: 'observation', critical: true },
      { title_en: 'Check ankles and feet for swelling', title_hi: 'टखनों और पैरों की सूजन देखें', window: 'evening', category: 'observation', critical: true },
      { title_en: 'Short supervised walk indoors', title_hi: 'घर के अंदर थोड़ा टहलाना', window: 'morning', category: 'mobility' },
      { title_en: 'Low-salt meal served as advised', title_hi: 'कम नमक वाला खाना दिया', window: 'afternoon', category: 'nutrition' },
      { title_en: 'Check chest wound / catheter site', title_hi: 'सीने का घाव / कैथेटर वाली जगह देखें', window: 'morning', category: 'wound', critical: true }
    ],
    vitals: [
      { type: 'bp', times: ['09:00', '21:00'], low: 95, high: 145, low2: 60, high2: 90 },
      { type: 'pulse', times: ['09:00', '21:00'], low: 50, high: 110 },
      { type: 'weight', times: ['08:00'], low: null, high: null },
      { type: 'spo2', times: ['09:00', '21:00'], low: 94, high: 100 }
    ],
    red_flags: [
      ...COMMON_FLAGS,
      { label_en: 'Sudden weight gain over 1.5 kg in two days', label_hi: 'दो दिन में 1.5 किलो से ज़्यादा वज़न बढ़ना', severity: 'urgent' },
      { label_en: 'Swelling in legs getting worse', label_hi: 'पैरों की सूजन बढ़ रही है', severity: 'urgent' },
      { label_en: 'Cannot lie flat / wakes up breathless', label_hi: 'सीधा लेट नहीं पाते / साँस फूलने से जागना', severity: 'urgent' }
    ]
  },
  {
    id: 'stroke',
    label: 'Stroke or neurological event',
    description: 'Swallowing safety, positioning, and daily function tracking.',
    tasks: [
      ...COMMON_TASKS,
      { title_en: 'Sit patient fully upright before any food or water', title_hi: 'खाना-पानी से पहले पूरी तरह बैठाएँ', window: 'anytime', category: 'nutrition', critical: true },
      { title_en: 'Watch for coughing or choking while eating', title_hi: 'खाते समय खाँसी/दम घुटने पर ध्यान दें', window: 'anytime', category: 'observation', critical: true },
      { title_en: 'Turn / reposition every 2 hours', title_hi: 'हर 2 घंटे में करवट बदलें', window: 'anytime', category: 'mobility', critical: true },
      { title_en: 'Limb exercises as taught by physiotherapist', title_hi: 'फिजियो द्वारा बताई गई हाथ-पैर की एक्सरसाइज़', window: 'afternoon', category: 'exercise' },
      { title_en: 'Skin check at back, hips and heels', title_hi: 'पीठ, कूल्हे और एड़ी की त्वचा देखें', window: 'evening', category: 'observation', critical: true }
    ],
    vitals: [
      { type: 'bp', times: ['09:00', '21:00'], low: 100, high: 150, low2: 60, high2: 95 },
      { type: 'sugar', times: ['08:00', '20:00'], low: 70, high: 200 },
      { type: 'temp', times: ['09:00'], low: 96, high: 100.4 }
    ],
    red_flags: [
      ...COMMON_FLAGS,
      { label_en: 'New weakness, drooping face or slurred speech', label_hi: 'नई कमज़ोरी, चेहरा टेढ़ा या बोलने में लड़खड़ाहट', severity: 'urgent' },
      { label_en: 'Choking or coughing on every swallow', label_hi: 'हर निगलने पर खाँसी या दम घुटना', severity: 'urgent' },
      { label_en: 'Seizure or sudden severe headache', label_hi: 'दौरा या अचानक तेज़ सिरदर्द', severity: 'urgent' }
    ]
  },
  {
    id: 'abdominal',
    label: 'Abdominal or general surgery',
    description: 'Wound, bowel and hydration watch after general surgery.',
    tasks: [
      ...COMMON_TASKS,
      { title_en: 'Check wound dressing — dry, clean, no smell', title_hi: 'घाव की पट्टी देखें — सूखी, साफ़, बदबू नहीं', window: 'morning', category: 'wound', critical: true },
      { title_en: 'Note whether bowels moved today', title_hi: 'आज शौच हुआ या नहीं, लिखें', window: 'evening', category: 'observation', critical: true },
      { title_en: 'Short walk to prevent clots', title_hi: 'खून जमने से बचने के लिए थोड़ा टहलाना', window: 'afternoon', category: 'mobility' },
      { title_en: 'Deep breathing exercises', title_hi: 'गहरी साँस के व्यायाम', window: 'morning', category: 'exercise' }
    ],
    vitals: [
      { type: 'temp', times: ['09:00', '21:00'], low: 96, high: 100.4 },
      { type: 'pulse', times: ['09:00'], low: 55, high: 110 }
    ],
    red_flags: [
      ...COMMON_FLAGS,
      { label_en: 'Wound is red, warm, bleeding or leaking', label_hi: 'घाव लाल, गरम, खून या पानी रिस रहा है', severity: 'urgent' },
      { label_en: 'Vomiting repeatedly or a hard swollen stomach', label_hi: 'बार-बार उल्टी या पेट सख्त/फूला हुआ', severity: 'urgent' },
      { label_en: 'No urine for 8 hours', label_hi: '8 घंटे से पेशाब नहीं', severity: 'urgent' }
    ]
  },
  {
    id: 'general',
    label: 'General recovery / long-term care',
    description: 'A blank-slate routine for chronic or non-surgical care at home.',
    tasks: COMMON_TASKS,
    vitals: [
      { type: 'bp', times: ['09:00'], low: 90, high: 150, low2: 60, high2: 95 },
      { type: 'temp', times: ['09:00'], low: 96, high: 100.4 }
    ],
    red_flags: COMMON_FLAGS
  }
];

export const getTemplate = (id: string): CareTemplate =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1];
