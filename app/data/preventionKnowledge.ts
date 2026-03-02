// Prevention Methods Knowledge Base
// Source: SmartSexResource (BCCDC)

export interface PreventionMethod {
  id: string;
  name: string;
  effectiveness: string;
  description: string;
  protects_against?: string[];
  partial_protection?: string[];
  notes?: string;
  coverage?: string;
  duration?: string;
  source_url: string;
}

export const PREVENTION_METHODS: PreventionMethod[] = [
  {
    id: 'condoms',
    name: 'Condoms (External/Internal)',
    effectiveness: 'Highly effective when used correctly and consistently (98% with perfect use, 87% typical use)',
    description: 'Barrier method that prevents exchange of bodily fluids during sexual activity',
    protects_against: ['Chlamydia', 'Gonorrhea', 'HIV', 'Hepatitis B', 'Trichomoniasis'],
    partial_protection: ['Herpes', 'HPV', 'Syphilis (if sores are covered)'],
    notes: 'Use water-based or silicone-based lubricant with condoms. Oil-based products damage latex.',
    source_url: 'https://smartsexresource.com/birth-control/barrier-methods/condoms/'
  },
  {
    id: 'prep',
    name: 'PrEP (Pre-Exposure Prophylaxis)',
    effectiveness: '99%+ effective at preventing HIV when taken as prescribed',
    description: 'Daily medication (or injectable) that prevents HIV infection in HIV-negative people',
    protects_against: ['HIV'],
    coverage: 'Covered by BC PharmaCare, MSP, and most private insurance. Free through BC PrEP Program for eligible individuals.',
    notes: 'Requires prescription, baseline testing, and regular monitoring every 3 months. Does not protect against other STIs - use condoms for comprehensive protection.',
    source_url: 'https://smartsexresource.com/hiv/prep/'
  },
  {
    id: 'pep',
    name: 'PEP (Post-Exposure Prophylaxis)',
    effectiveness: 'Highly effective when started within 72 hours of exposure',
    description: 'Emergency HIV prevention medication taken after potential exposure',
    protects_against: ['HIV'],
    duration: '28-day course of antiretroviral medication',
    notes: 'Must start within 72 hours of exposure (ideally within 24 hours). Available 24/7 at emergency departments. Covered by BC PharmaCare and most insurance.',
    source_url: 'https://smartsexresource.com/hiv/pep/'
  },
  {
    id: 'dental_dams',
    name: 'Dental Dams',
    effectiveness: 'Effective barrier for oral-vaginal and oral-anal contact',
    description: 'Thin latex or polyurethane sheet used as barrier during oral sex',
    protects_against: ['Chlamydia', 'Gonorrhea', 'Herpes', 'HPV', 'Hepatitis'],
    notes: 'Can make your own by cutting open a condom. Use only one side and don\'t reuse.',
    source_url: 'https://smartsexresource.com/prevention/'
  },
  {
    id: 'hpv_vaccine',
    name: 'HPV Vaccine (Gardasil 9)',
    effectiveness: 'Nearly 100% effective against targeted HPV types when given before exposure',
    description: 'Vaccine protecting against 9 types of HPV that cause most cancers and genital warts',
    protects_against: ['HPV types 6, 11, 16, 18, 31, 33, 45, 52, 58'],
    coverage: 'Free in BC for students in Grade 6. Available for others up to age 45 (may require payment).',
    notes: '2-3 dose series depending on age. Most effective when given before sexual activity begins.',
    source_url: 'https://smartsexresource.com/prevention/vaccines/'
  },
  {
    id: 'hep_b_vaccine',
    name: 'Hepatitis B Vaccine',
    effectiveness: '95%+ effective after full series',
    description: 'Vaccine preventing hepatitis B infection',
    protects_against: ['Hepatitis B'],
    coverage: 'Part of routine infant immunization in BC. Catch-up programs available for adults.',
    notes: '3-dose series provides long-term protection. Especially important for people at higher risk.',
    source_url: 'https://smartsexresource.com/prevention/vaccines/'
  }
];

export function getPreventionInfo(methodId: string): PreventionMethod | undefined {
  return PREVENTION_METHODS.find(method => method.id === methodId);
}

export function searchPreventionMethods(query: string): PreventionMethod[] {
  const lowerQuery = query.toLowerCase();
  return PREVENTION_METHODS.filter(method => 
    method.name.toLowerCase().includes(lowerQuery) ||
    method.description.toLowerCase().includes(lowerQuery) ||
    method.protects_against?.some(sti => sti.toLowerCase().includes(lowerQuery))
  );
}
