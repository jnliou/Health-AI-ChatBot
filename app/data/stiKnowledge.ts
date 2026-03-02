// STI Knowledge Base
// Data structure mirrors SmartSexResource content
// Sources: 
// - https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/
// - https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf

export interface STICondition {
  id: string;
  name: string;
  alternativeNames?: string[];
  category: 'bacterial' | 'viral' | 'parasitic' | 'fungal';
  transmission: string[];
  symptoms: {
    common: string[];
    often_asymptomatic: boolean;
    timeline?: string;
  };
  testing: {
    methods: string[];
    window_period: string;
    frequency_recommendation?: string;
  };
  treatment: {
    available: boolean;
    type: string;
    details: string;
  };
  prevention: string[];
  complications?: string[];
  source_url: string;
  resources?: {
    pdf_english?: string;
    pdf_farsi?: string;
    pdf_chinese_traditional?: string;
    pdf_chinese_simplified?: string;
    pdf_punjabi?: string;
    pdf_french?: string;
  };
}

export const STI_CONDITIONS: STICondition[] = [
  {
    id: 'chlamydia',
    name: 'Chlamydia',
    category: 'bacterial',
    transmission: [
      'Vaginal, anal, or oral sex',
      'Sharing sex toys',
      'From parent to baby during childbirth'
    ],
    symptoms: {
      common: [
        'Unusual discharge from vagina, penis, or rectum',
        'Pain or burning when peeing',
        'Pain during sex',
        'Bleeding between periods or after sex',
        'Pain in lower abdomen',
        'Swollen or painful testicles (rare)'
      ],
      often_asymptomatic: true,
      timeline: 'Symptoms may appear 1-3 weeks after exposure, but many people have no symptoms'
    },
    testing: {
      methods: ['Urine test', 'Swab (vaginal, cervical, urethral, rectal, or throat)'],
      window_period: '2 weeks after potential exposure',
      frequency_recommendation: 'Sexually active people under 25 should test annually; sexually active people 25+ should test if they have new or multiple partners'
    },
    treatment: {
      available: true,
      type: 'Curable with antibiotics',
      details: 'Single dose or 7-day course of antibiotics. Partners should also be treated.'
    },
    prevention: [
      'Use condoms and dental dams',
      'Regular testing',
      'Avoid sharing sex toys or cover with condom and clean between uses'
    ],
    complications: [
      'Pelvic inflammatory disease (PID)',
      'Infertility',
      'Ectopic pregnancy',
      'Chronic pelvic pain',
      'Increased risk of HIV transmission'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/chlamydia/',
    resources: {
      pdf_english: 'https://smartsexresource.com/resources/chlamydia-information-sheet/',
      pdf_farsi: 'https://smartsexresource.com/wp-content/uploads/2024/11/Chlamydia-Information-Sheet-Farsi.pdf',
      pdf_chinese_traditional: 'https://smartsexresource.com/wp-content/uploads/2024/11/Chlamydia-Information-Sheet-Chinese-Traditional.pdf',
      pdf_chinese_simplified: 'https://smartsexresource.com/wp-content/uploads/2024/11/Chlamydia-Information-Sheet-Chinese-Simplified.pdf',
      pdf_punjabi: 'https://smartsexresource.com/wp-content/uploads/2024/11/Chlamydia-Information-Sheet-Punjabi.pdf',
      pdf_french: 'https://smartsexresource.com/wp-content/uploads/2024/11/Chlamydia-Information-Sheet-French.pdf'
    }
  },
  {
    id: 'gonorrhea',
    name: 'Gonorrhea',
    alternativeNames: ['The Clap'],
    category: 'bacterial',
    transmission: [
      'Vaginal, anal, or oral sex',
      'Sharing sex toys',
      'From parent to baby during childbirth'
    ],
    symptoms: {
      common: [
        'Thick green or yellow discharge from vagina, penis, or rectum',
        'Pain or burning when peeing',
        'Bleeding between periods or after sex',
        'Pain in lower abdomen',
        'Swollen or painful testicles',
        'Sore throat (if throat infection)'
      ],
      often_asymptomatic: true,
      timeline: 'Symptoms typically appear within 2-14 days, but up to 50% of people have no symptoms'
    },
    testing: {
      methods: ['Urine test', 'Swab (vaginal, cervical, urethral, rectal, or throat)'],
      window_period: '2 weeks after potential exposure',
      frequency_recommendation: 'Annual testing for sexually active people, more frequent if high risk'
    },
    treatment: {
      available: true,
      type: 'Curable with antibiotics',
      details: 'Usually treated with antibiotic injection. Drug-resistant strains are increasing.'
    },
    prevention: [
      'Use condoms and dental dams',
      'Regular testing',
      'Avoid sharing sex toys'
    ],
    complications: [
      'Pelvic inflammatory disease (PID)',
      'Infertility',
      'Ectopic pregnancy',
      'Disseminated gonococcal infection (spreads to blood/joints)',
      'Increased risk of HIV transmission'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/gonorrhea/',
    resources: {
      pdf_english: 'https://smartsexresource.com/resources/gonorrhea-information-sheet/',
      pdf_farsi: 'https://smartsexresource.com/wp-content/uploads/2024/11/Gonorrhea-Information-Sheet-Farsi.pdf',
      pdf_chinese_traditional: 'https://smartsexresource.com/wp-content/uploads/2024/11/Gonorrhea-Information-Sheet-Chinese-Traditional.pdf',
      pdf_chinese_simplified: 'https://smartsexresource.com/wp-content/uploads/2024/11/Gonorrhea-Information-Sheet-Chinese-Simplified.pdf',
      pdf_punjabi: 'https://smartsexresource.com/wp-content/uploads/2024/11/Gonorrhea-Information-Sheet-Punjabi.pdf',
      pdf_french: 'https://smartsexresource.com/wp-content/uploads/2024/11/Gonorrhea-Information-Sheet-French.pdf'
    }
  },
  {
    id: 'syphilis',
    name: 'Syphilis',
    category: 'bacterial',
    transmission: [
      'Direct contact with syphilis sore during vaginal, anal, or oral sex',
      'From parent to baby during pregnancy or childbirth'
    ],
    symptoms: {
      common: [
        'Primary stage: Painless sore (chancre) at infection site',
        'Secondary stage: Rash on palms/soles, flu-like symptoms, swollen lymph nodes',
        'Latent stage: No symptoms',
        'Tertiary stage: Damage to heart, brain, nerves, organs'
      ],
      often_asymptomatic: true,
      timeline: 'Primary sore appears 10-90 days after exposure (average 21 days)'
    },
    testing: {
      methods: ['Blood test', 'Swab of sore (if present)'],
      window_period: '1-3 months for blood test accuracy',
      frequency_recommendation: 'At least annually for people at higher risk; every 3-6 months for very high risk'
    },
    treatment: {
      available: true,
      type: 'Curable with antibiotics',
      details: 'Penicillin injection. Early treatment prevents long-term complications.'
    },
    prevention: [
      'Use condoms (though sores can occur outside covered area)',
      'Regular testing',
      'Avoid contact with sores'
    ],
    complications: [
      'Damage to heart, brain, eyes, nerves',
      'Dementia',
      'Paralysis',
      'Blindness',
      'Death (if untreated tertiary syphilis)',
      'Congenital syphilis in babies'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/syphilis/',
    resources: {
      pdf_english: 'https://smartsexresource.com/wp-content/uploads/resources/Syphilis-FAQs-2024-11.pdf',
      pdf_farsi: 'https://smartsexresource.com/wp-content/uploads/resources/Syphilis-FAQs-2024-11-Farsi.pdf',
      pdf_chinese_traditional: 'https://smartsexresource.com/wp-content/uploads/resources/Syphilis-FAQs-2024-11-Chinese-Traditional.pdf',
      pdf_chinese_simplified: 'https://smartsexresource.com/wp-content/uploads/resources/Syphilis-FAQs-2024-11-Chinese-Simplified.pdf'
    }
  },
  {
    id: 'hiv',
    name: 'HIV',
    alternativeNames: ['Human Immunodeficiency Virus'],
    category: 'viral',
    transmission: [
      'Unprotected vaginal or anal sex',
      'Sharing needles or drug equipment',
      'From parent to child during pregnancy, childbirth, or breastfeeding',
      'Blood transfusion (very rare in Canada)',
      'Occupational exposure (healthcare workers)'
    ],
    symptoms: {
      common: [
        'Acute HIV: Flu-like symptoms 2-4 weeks after infection (fever, fatigue, rash, swollen lymph nodes)',
        'Chronic HIV: May have no symptoms for years',
        'Advanced HIV/AIDS: Severe immune system damage, opportunistic infections'
      ],
      often_asymptomatic: true,
      timeline: 'Acute symptoms appear 2-4 weeks after infection, then often no symptoms for years'
    },
    testing: {
      methods: [
        'Blood test (4th generation antigen/antibody)',
        'Rapid point-of-care test',
        'Oral swab test',
        'Home test kit'
      ],
      window_period: '3-12 weeks depending on test type; 4th generation tests can detect at 2-6 weeks',
      frequency_recommendation: 'At least once in lifetime; annually or more often if at higher risk'
    },
    treatment: {
      available: true,
      type: 'Manageable with medication (not curable)',
      details: 'Antiretroviral therapy (ART) can reduce viral load to undetectable levels (U=U: Undetectable = Untransmittable). People with HIV on effective treatment can live long, healthy lives.'
    },
    prevention: [
      'Use condoms consistently',
      'PrEP (pre-exposure prophylaxis) for high-risk individuals',
      'PEP (post-exposure prophylaxis) within 72 hours of exposure',
      'Don\'t share needles',
      'Treatment as prevention (U=U)',
      'Regular testing'
    ],
    complications: [
      'AIDS (advanced stage)',
      'Opportunistic infections',
      'Certain cancers',
      'Neurological problems',
      'Kidney disease',
      'Heart disease'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/hiv/'
  },
  {
    id: 'herpes',
    name: 'Herpes',
    alternativeNames: ['HSV', 'Genital Herpes', 'Oral Herpes'],
    category: 'viral',
    transmission: [
      'Skin-to-skin contact with infected area',
      'Vaginal, anal, or oral sex',
      'Can transmit even without visible sores',
      'HSV-1 (typically oral) can spread to genitals through oral sex',
      'HSV-2 (typically genital) can spread to mouth'
    ],
    symptoms: {
      common: [
        'Painful blisters or sores on genitals, anus, mouth, or other areas',
        'Tingling or burning before outbreak',
        'Flu-like symptoms during first outbreak',
        'Painful urination',
        'Many people have mild or no symptoms'
      ],
      often_asymptomatic: true,
      timeline: 'First outbreak typically appears 2-12 days after exposure; subsequent outbreaks vary'
    },
    testing: {
      methods: [
        'Swab of active sore (most accurate)',
        'Blood test (type-specific antibody test)',
        'Note: Blood tests may not detect recent infections'
      ],
      window_period: '2-12 weeks for antibodies to develop',
      frequency_recommendation: 'Testing usually done if symptoms present; not part of routine STI screening'
    },
    treatment: {
      available: true,
      type: 'Not curable, but manageable',
      details: 'Antiviral medication can reduce outbreak frequency, severity, and transmission risk. Suppressive therapy available for frequent outbreaks.'
    },
    prevention: [
      'Use condoms (though herpes can spread from uncovered areas)',
      'Avoid sex during outbreaks',
      'Antiviral medication reduces transmission',
      'Dental dams for oral sex'
    ],
    complications: [
      'Recurrent outbreaks (vary in frequency)',
      'Meningitis (rare)',
      'Increased risk of HIV transmission',
      'Neonatal herpes (if transmitted during childbirth)',
      'Psychological impact'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/herpes/'
  },
  {
    id: 'hpv',
    name: 'HPV',
    alternativeNames: ['Human Papillomavirus', 'Genital Warts'],
    category: 'viral',
    transmission: [
      'Skin-to-skin contact during vaginal, anal, or oral sex',
      'Can transmit even without penetration',
      'Very common - most sexually active people get HPV at some point'
    ],
    symptoms: {
      common: [
        'Most HPV infections have no symptoms',
        'Low-risk types: Genital warts (small bumps or groups of bumps)',
        'High-risk types: Usually no symptoms, can cause cell changes leading to cancer'
      ],
      often_asymptomatic: true,
      timeline: 'Warts can appear weeks to months after exposure; most infections clear on their own within 2 years'
    },
    testing: {
      methods: [
        'Pap test (cervical screening)',
        'HPV test (cervical)',
        'Visual inspection for warts',
        'No approved test for HPV in penis, anus, or throat'
      ],
      window_period: 'Variable; most infections clear naturally',
      frequency_recommendation: 'Cervical screening every 3 years (ages 25-69 in BC)'
    },
    treatment: {
      available: true,
      type: 'No cure for virus; treatments for symptoms',
      details: 'Warts can be treated with topical medications, freezing, or surgical removal. Pre-cancerous cell changes can be monitored or treated. Most infections clear naturally.'
    },
    prevention: [
      'HPV vaccine (Gardasil 9) - most effective before sexual activity begins',
      'Condoms reduce but don\'t eliminate risk',
      'Regular cervical screening',
      'Vaccination programs in BC schools (Grade 6)'
    ],
    complications: [
      'Cervical cancer',
      'Other cancers (anal, penile, throat, vaginal, vulvar)',
      'Recurrent genital warts',
      'Respiratory papillomatosis (rare, if passed to baby during birth)'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/hpv/'
  },
  {
    id: 'hepatitis-b',
    name: 'Hepatitis B',
    alternativeNames: ['Hep B', 'HBV'],
    category: 'viral',
    transmission: [
      'Unprotected vaginal or anal sex',
      'Sharing needles or drug equipment',
      'Sharing personal items (razors, toothbrushes)',
      'From parent to baby during childbirth',
      'Exposure to infected blood'
    ],
    symptoms: {
      common: [
        'Acute: Fatigue, nausea, vomiting, abdominal pain, dark urine, jaundice',
        'Chronic: Often no symptoms until liver damage occurs',
        'Many people (especially children) have no symptoms'
      ],
      often_asymptomatic: true,
      timeline: 'Symptoms appear 6 weeks to 6 months after exposure (average 90 days)'
    },
    testing: {
      methods: ['Blood test (HBsAg, anti-HBs, anti-HBc)'],
      window_period: '6 weeks to 6 months',
      frequency_recommendation: 'One-time testing recommended; more frequent if high risk or chronic infection'
    },
    treatment: {
      available: true,
      type: 'Acute infections often resolve; chronic infections manageable',
      details: 'No specific treatment for acute infection. Chronic infection monitored and may require antiviral medication. Vaccine available and highly effective.'
    },
    prevention: [
      'Hepatitis B vaccine (most effective prevention)',
      'Use condoms',
      'Don\'t share needles or personal items',
      'Vaccination included in BC infant immunization program'
    ],
    complications: [
      'Chronic liver infection (5-10% of adults)',
      'Cirrhosis',
      'Liver cancer',
      'Liver failure',
      'Death (rare with chronic infection)'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/hepatitis-b/'
  },
  {
    id: 'hepatitis-c',
    name: 'Hepatitis C',
    alternativeNames: ['Hep C', 'HCV'],
    category: 'viral',
    transmission: [
      'Sharing needles or drug equipment (most common)',
      'Unprotected anal sex (especially with HIV co-infection or rough sex)',
      'Sharing personal items with blood (razors, toothbrushes)',
      'Unsterile tattoo/piercing equipment',
      'From parent to baby during childbirth (rare)',
      'Blood transfusion before 1992 (rare now)'
    ],
    symptoms: {
      common: [
        'Acute: Often no symptoms, or fatigue, nausea, jaundice',
        'Chronic: Often no symptoms for years until liver damage',
        '70-80% develop chronic infection'
      ],
      often_asymptomatic: true,
      timeline: 'Symptoms (if any) appear 2 weeks to 6 months after exposure'
    },
    testing: {
      methods: ['Blood test (anti-HCV antibody, then HCV RNA if positive)'],
      window_period: '8-12 weeks for antibody test',
      frequency_recommendation: 'One-time testing recommended; annual testing for people who inject drugs or engage in high-risk activities'
    },
    treatment: {
      available: true,
      type: 'Curable with direct-acting antivirals',
      details: '8-12 week course of oral medication. Cure rate over 95%. Treatment covered by BC PharmaCare.'
    },
    prevention: [
      'Don\'t share needles or drug equipment',
      'Use condoms for anal sex',
      'Don\'t share personal items with blood',
      'Ensure sterile tattoo/piercing equipment',
      'No vaccine available yet'
    ],
    complications: [
      'Chronic liver infection (70-80% of cases)',
      'Cirrhosis',
      'Liver cancer',
      'Liver failure',
      'Need for liver transplant'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/hepatitis-c/'
  },
  {
    id: 'trichomoniasis',
    name: 'Trichomoniasis',
    alternativeNames: ['Trich'],
    category: 'parasitic',
    transmission: [
      'Vaginal sex',
      'Sharing sex toys',
      'Genital contact',
      'Rarely transmitted through oral or anal sex'
    ],
    symptoms: {
      common: [
        'Unusual discharge (yellow-green, frothy, strong odor)',
        'Itching, burning, or soreness of genitals',
        'Pain during sex or urination',
        'Bleeding after sex',
        'Many people have no symptoms'
      ],
      often_asymptomatic: true,
      timeline: 'Symptoms typically appear 5-28 days after exposure'
    },
    testing: {
      methods: ['Swab (vaginal or urethral)', 'Urine test', 'Pap test may detect'],
      window_period: '5-28 days',
      frequency_recommendation: 'Not part of routine screening; test if symptoms or partner diagnosed'
    },
    treatment: {
      available: true,
      type: 'Curable with antibiotics',
      details: 'Single dose or 7-day course of metronidazole or tinidazole. Partners should be treated.'
    },
    prevention: [
      'Use condoms',
      'Avoid sharing sex toys',
      'Regular testing if symptomatic'
    ],
    complications: [
      'Increased risk of HIV transmission',
      'Pelvic inflammatory disease',
      'Preterm birth in pregnancy',
      'Low birth weight babies'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/trichomoniasis/'
  },
  {
    id: 'mycoplasma-genitalium',
    name: 'Mycoplasma Genitalium',
    alternativeNames: ['M. genitalium', 'Mgen', 'MG'],
    category: 'bacterial',
    transmission: [
      'Vaginal or anal sex',
      'Possibly oral sex'
    ],
    symptoms: {
      common: [
        'Unusual discharge from vagina, penis, or rectum',
        'Pain or burning when peeing',
        'Pain during sex',
        'Bleeding between periods or after sex',
        'Pelvic or abdominal pain',
        'Many people have no symptoms'
      ],
      often_asymptomatic: true,
      timeline: 'Variable; many never develop symptoms'
    },
    testing: {
      methods: ['Urine test', 'Swab (vaginal, cervical, urethral, or rectal)', 'PCR test'],
      window_period: '1-3 weeks',
      frequency_recommendation: 'Not routinely tested; consider if persistent symptoms or treatment-resistant urethritis/cervicitis'
    },
    treatment: {
      available: true,
      type: 'Curable but antibiotic resistance is common',
      details: 'May require extended treatment or multiple antibiotics. Resistance testing recommended before treatment.'
    },
    prevention: [
      'Use condoms',
      'Regular STI testing',
      'Partner notification and treatment'
    ],
    complications: [
      'Pelvic inflammatory disease',
      'Infertility',
      'Increased risk of HIV transmission',
      'Chronic urethritis'
    ],
    source_url: 'https://smartsexresource.com/sexually-transmitted-infections/mycoplasma-genitalium/'
  }
];

// Testing window periods reference
export const TESTING_WINDOWS = {
  chlamydia: '2 weeks',
  gonorrhea: '2 weeks',
  syphilis: '1-3 months',
  hiv: '2-12 weeks (depends on test type)',
  herpes: '2-12 weeks',
  hepatitis_b: '6 weeks to 6 months',
  hepatitis_c: '8-12 weeks',
  trichomoniasis: '5-28 days',
  mycoplasma: '1-3 weeks'
};

// Common testing recommendations
export const TESTING_RECOMMENDATIONS = {
  sexually_active_under_25: [
    'Annual testing for chlamydia and gonorrhea',
    'At least one HIV test in lifetime',
    'Consider syphilis testing if multiple partners'
  ],
  sexually_active_over_25: [
    'Test for chlamydia and gonorrhea if new or multiple partners',
    'At least one HIV test in lifetime',
    'Consider annual testing if multiple partners'
  ],
  high_risk: [
    'Test every 3-6 months for chlamydia, gonorrhea, syphilis, and HIV',
    'Consider hepatitis B and C testing',
    'Discuss PrEP for HIV prevention'
  ],
  after_unprotected_sex: [
    'Test after window period for each STI',
    'Consider PEP for HIV within 72 hours',
    'Retest 3 months later for syphilis and HIV'
  ],
  men_who_have_sex_with_men: [
    'Test every 3-6 months for chlamydia, gonorrhea (including rectal and throat), syphilis, and HIV',
    'Annual hepatitis B and C testing',
    'Discuss PrEP for HIV prevention'
  ],
  people_who_inject_drugs: [
    'Annual HIV and hepatitis C testing (minimum)',
    'More frequent testing if sharing equipment',
    'Hepatitis B vaccination if not immune'
  ]
};

// Prevention methods
export const PREVENTION_METHODS = {
  condoms: {
    effectiveness: 'Highly effective when used correctly and consistently',
    protects_against: ['HIV', 'Chlamydia', 'Gonorrhea', 'Trichomoniasis'],
    partial_protection: ['Herpes', 'HPV', 'Syphilis'],
    notes: 'Use water or silicone-based lubricant; check expiry date; store properly'
  },
  dental_dams: {
    effectiveness: 'Reduces risk of oral transmission',
    protects_against: ['Herpes', 'Gonorrhea', 'Syphilis', 'HPV'],
    notes: 'Use for oral-vaginal or oral-anal contact; can make from condom if needed'
  },
  vaccines: {
    hpv: 'Gardasil 9 - protects against 9 HPV types; most effective before sexual activity',
    hepatitis_b: 'Part of routine infant immunization; catch-up available for adults',
    hepatitis_a: 'Recommended for MSM and people with chronic liver disease'
  },
  prep: {
    name: 'Pre-Exposure Prophylaxis',
    protects_against: 'HIV',
    effectiveness: 'Over 99% effective when taken as prescribed',
    notes: 'Daily pill or injectable; requires prescription and regular monitoring',
    coverage: 'Covered by BC PharmaCare and many private plans'
  },
  pep: {
    name: 'Post-Exposure Prophylaxis',
    protects_against: 'HIV',
    timing: 'Must start within 72 hours of exposure (sooner is better)',
    duration: '28-day course of antiretroviral medication',
    notes: 'Available at emergency departments and sexual health clinics'
  },
  testing: {
    description: 'Regular STI testing',
    benefit: 'Early detection and treatment prevents complications and transmission',
    notes: 'Know your status and your partners\' status'
  }
};

// Get information for chatbot responses
const STI_TYPO_ALIASES: Record<string, string> = {
  clamydia: 'chlamydia',
  chlymidia: 'chlamydia',
  chlamidia: 'chlamydia',
  chlyamdia: 'chlamydia',
  gonorea: 'gonorrhea',
  gonorhea: 'gonorrhea',
  gonorrhoea: 'gonorrhea',
  syfilis: 'syphilis',
  sifilis: 'syphilis',
  siflyis: 'syphilis',
  herpies: 'herpes',
  herpis: 'herpes',
  hepititis: 'hepatitis',
  trichamoniasis: 'trichomoniasis',
  trichamonas: 'trichomoniasis',
  'mycoplasma genitalum': 'mycoplasma genitalium',
};

function normalizeTerm(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');
}

export function getSTIInfo(stiName: string): STICondition | undefined {
  const raw = normalizeTerm(stiName);
  const normalized = STI_TYPO_ALIASES[raw] ?? raw;

  return STI_CONDITIONS.find((sti) => {
    const name = normalizeTerm(sti.name);
    const id = normalizeTerm(sti.id.replace(/-/g, ' '));
    const alternatives = (sti.alternativeNames ?? []).map((alt) => normalizeTerm(alt));

    if (name === normalized || id === normalized || alternatives.includes(normalized)) {
      return true;
    }

    // Allow partial matches like "hep b" -> Hepatitis B
    return (
      (normalized.includes('hep b') && sti.id === 'hepatitis-b') ||
      (normalized.includes('hep c') && sti.id === 'hepatitis-c') ||
      (normalized.includes('mycoplasma') && sti.id === 'mycoplasma-genitalium')
    );
  });
}

export function searchSTIsBySymptom(symptom: string): STICondition[] {
  const normalized = symptom.toLowerCase();
  return STI_CONDITIONS.filter(sti =>
    sti.symptoms.common.some(s => s.toLowerCase().includes(normalized))
  );
}

export function getTestingRecommendation(category: keyof typeof TESTING_RECOMMENDATIONS): string[] {
  return TESTING_RECOMMENDATIONS[category] || [];
}

export function getPreventionInfo(method: keyof typeof PREVENTION_METHODS) {
  return PREVENTION_METHODS[method];
}
