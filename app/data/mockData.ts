// Mock data for SIA prototype based on SmartSexResource

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  postal: string;
  phone: string;
  lat: number;
  lng: number;
  distance?: number;
  hours: string;
  services: string[];
  languages: string[];
  features: string[];
  sourceUrl: string;
}

export interface EducationCard {
  id: string;
  title: string;
  summary: string;
  category: string;
  sourceUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { label: string; url: string }[];
  timestamp: Date;
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh-hans', name: 'Chinese (Simplified)' },
  { code: 'zh-hant', name: 'Chinese (Traditional)' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fa', name: 'Farsi' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'so', name: 'Somali' },
  { code: 'sw', name: 'Swahili' },
  { code: 'am', name: 'Amharic' },
  { code: 'th', name: 'Thai' },
];

// Mock clinics based on BC sexual health clinic directory
export const MOCK_CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'Bute Street Clinic',
    address: '1290 Bute Street',
    city: 'Vancouver',
    postal: 'V6E 1Z7',
    phone: '604-660-7400',
    lat: 49.2827,
    lng: -123.1207,
    hours: 'Mon-Fri: 9am-4pm',
    services: ['STI Testing', 'HIV Testing', 'Contraception', 'PrEP/PEP'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    features: ['Walk-in', 'LGBTQ2S+ friendly', 'Youth-friendly'],
    sourceUrl: 'https://smartsexresource.com/clinics-testing/',
  },
  {
    id: '2',
    name: 'Vancouver Coastal Health - Evergreen',
    address: '3425 E Hastings St',
    city: 'Vancouver',
    postal: 'V5K 2A4',
    phone: '604-675-3800',
    lat: 49.2808,
    lng: -123.0367,
    hours: 'Mon-Thu: 8:30am-4pm, Fri: 8:30am-2pm',
    services: ['STI Testing', 'HIV Testing', 'Contraception', 'Counseling'],
    languages: ['English', 'Tagalog', 'Punjabi'],
    features: ['Appointment required', 'Youth-friendly', 'Accessible'],
    sourceUrl: 'https://smartsexresource.com/clinics-testing/',
  },
  {
    id: '3',
    name: 'Options for Sexual Health - Vancouver',
    address: '1525 Davie Street',
    city: 'Vancouver',
    postal: 'V6G 2B4',
    phone: '604-731-4252',
    lat: 49.2770,
    lng: -123.1403,
    hours: 'Mon, Wed, Fri: 10am-5pm',
    services: ['STI Testing', 'Birth Control', 'Pregnancy Testing', 'Emergency Contraception'],
    languages: ['English', 'French'],
    features: ['Walk-in', 'LGBTQ2S+ friendly', 'Youth-friendly'],
    sourceUrl: 'https://smartsexresource.com/clinics-testing/',
  },
  {
    id: '4',
    name: 'Surrey Urban Health Centre',
    address: '10667 135A Street',
    city: 'Surrey',
    postal: 'V3T 4E2',
    phone: '604-587-4750',
    lat: 49.1913,
    lng: -122.8490,
    hours: 'Mon-Fri: 8:30am-4:30pm',
    services: ['STI Testing', 'HIV Testing', 'Harm Reduction', 'Contraception'],
    languages: ['English', 'Punjabi', 'Hindi'],
    features: ['Walk-in', 'Accessible'],
    sourceUrl: 'https://smartsexresource.com/clinics-testing/',
  },
];

// Mock education content from SmartSexResource
export const EDUCATION_CARDS: EducationCard[] = [
  {
    id: 'sti-basics',
    title: 'What are STIs?',
    summary: 'Sexually transmitted infections (STIs) are infections passed through sexual contact. Many STIs have no symptoms, which is why regular testing is important.',
    category: 'STI Information',
    sourceUrl: 'https://smartsexresource.com/topics/sexually-transmitted-infections',
  },
  {
    id: 'testing-info',
    title: 'Getting Tested',
    summary: 'Regular STI testing is a normal part of taking care of your sexual health. Testing is confidential and available at sexual health clinics across BC.',
    category: 'Testing',
    sourceUrl: 'https://smartsexresource.com/clinics-testing/',
  },
  {
    id: 'contraception',
    title: 'Birth Control Options',
    summary: 'There are many types of birth control available in BC, including pills, IUDs, implants, and barrier methods. Find what works best for you.',
    category: 'Contraception',
    sourceUrl: 'https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control',
  },
  {
    id: 'prep',
    title: 'PrEP: HIV Prevention',
    summary: 'PrEP (Pre-Exposure Prophylaxis) is a medication that can prevent HIV. It\'s available for free in BC for eligible individuals.',
    category: 'Prevention',
    sourceUrl: 'https://smartsexresource.com/topics/prep',
  },
  {
    id: 'consent',
    title: 'Consent & Communication',
    summary: 'Consent is ongoing, enthusiastic agreement. Healthy sexual relationships are built on clear communication and mutual respect.',
    category: 'Relationships',
    sourceUrl: 'https://smartsexresource.com/topics/consent',
  },
];

// Triage questions
export const TRIAGE_QUESTIONS = [
  {
    id: 'symptoms',
    question: 'Are you experiencing any symptoms?',
    type: 'boolean',
    options: ['Yes', 'No'],
  },
  {
    id: 'symptom-type',
    question: 'What symptoms are you experiencing?',
    type: 'multiple',
    options: [
      'Unusual discharge',
      'Pain or burning during urination',
      'Genital sores or bumps',
      'Rash or itching',
      'Abdominal pain',
      'Other',
    ],
    showWhen: { symptoms: 'Yes' },
  },
  {
    id: 'symptom-duration',
    question: 'How long have you had these symptoms?',
    type: 'single',
    options: ['Less than 1 week', '1-2 weeks', '2-4 weeks', 'More than 4 weeks'],
    showWhen: { symptoms: 'Yes' },
  },
];

// Generate a random 6-character access code
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Calculate distance between two points (simplified)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

