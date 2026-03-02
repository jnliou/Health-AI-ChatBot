// FAQ Knowledge Base
// Based on SmartSexResource Answered Questions
// Source: https://smartsexresource.com/answered-questions/

export interface FAQ {
  id: string;
  question: string;
  category: string;
  answer: string;
  keywords: string[];
  source_url: string;
}

export const FAQ_CATEGORIES = [
  'STI Testing',
  'Condoms & Barriers',
  'Birth Control',
  'HIV & PrEP',
  'Pregnancy',
  'Sexual Health',
  'LGBTQ2S+',
  'Relationships'
];

export const FAQS: FAQ[] = [
  {
    id: 'sti-testing-no-symptoms',
    question: 'Should I get tested for STIs if I have no symptoms?',
    category: 'STI Testing',
    answer: 'Yes! Many STIs have no symptoms at all, especially in the early stages. Up to 70% of people with chlamydia and 50% of people with gonorrhea have no symptoms. The only way to know your status is to get tested.\n\nRegular testing is recommended even without symptoms if you:\n• Are sexually active\n• Have new or multiple partners\n• Had unprotected sex\n• Are under 25 (higher risk for some STIs)\n• Share injection drug equipment\n\nIn BC, testing is confidential and often free at sexual health clinics.',
    keywords: ['symptoms', 'asymptomatic', 'no symptoms', 'should i test', 'regular testing'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'how-often-test',
    question: 'How often should I get tested for STIs?',
    category: 'STI Testing',
    answer: 'Testing frequency depends on your sexual activity and risk factors:\n\nSexually active under 25:\n• Annual testing for chlamydia and gonorrhea (minimum)\n• HIV test at least once in lifetime\n\nSexually active 25+:\n• Test if you have new or multiple partners\n• Annual testing if multiple partners\n\nHigher risk (MSM, multiple partners, sex work):\n• Every 3-6 months for chlamydia, gonorrhea, syphilis, HIV\n• Include rectal and throat testing if applicable\n\nAfter unprotected sex:\n• Test after the appropriate window period\n• Retest 3 months later for syphilis and HIV\n\nEveryone:\n• At least one HIV test in lifetime\n• Test before sex with a new partner',
    keywords: ['how often', 'frequency', 'when to test', 'how many times'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'free-testing-bc',
    question: 'Where can I get free STI testing in BC?',
    category: 'STI Testing',
    answer: 'Free or low-cost STI testing is available at:\n\nSexual Health Clinics:\n• Confidential testing and treatment\n• No MSP required at many clinics\n• Walk-in and appointment options\n• Youth-friendly services\n\nGetCheckedOnline:\n• Order test kit online (no symptoms required)\n• Collect sample at home or lab\n• Results online in 3-5 days\n• Available across BC\n\nPublic Health Units:\n• Free STI testing\n• Contact tracing support\n• Treatment provided\n\nSome Walk-in Clinics:\n• May offer free testing (varies by clinic)\n• MSP coverage typically required\n\nYour Family Doctor:\n• Covered by MSP\n• Can order comprehensive testing\n\nCost: Most STI testing and treatment is free or covered by MSP in BC.',
    keywords: ['free', 'cost', 'where', 'getcheckedonline', 'clinic'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'condom-broke',
    question: 'The condom broke - what should I do?',
    category: 'Condoms & Barriers',
    answer: 'If a condom breaks during sex, here are the steps to take:\n\nImmediate actions:\n1. Stop sexual activity\n2. Withdraw and remove the broken condom\n3. Urinate and gently wash genitals with soap and water\n4. Don\'t douche (can push bacteria/viruses further in)\n\nWithin 72 hours - consider PEP:\n• If risk of HIV exposure (unknown partner status, HIV+ partner)\n• Go to emergency department or sexual health clinic\n• PEP (post-exposure prophylaxis) most effective within 24 hours\n• Free 28-day medication course\n\nWithin 5 days - emergency contraception:\n• If pregnancy is possible\n• Plan B (levonorgestrel): Most effective within 72 hours, can use up to 5 days\n• Ella (ulipristal): Effective up to 5 days\n• Copper IUD: Most effective method, can be inserted up to 7 days\n• Available at pharmacies, sexual health clinics, family doctor\n\nWithin 2-4 weeks - STI testing:\n• Test after window period (2 weeks for chlamydia/gonorrhea)\n• Retest at 3 months for HIV and syphilis\n• Consider testing for hepatitis B and C if applicable\n\nPrevention:\n• Check condom expiry date\n• Use water or silicone-based lube\n• Store condoms properly (not in wallet/hot places)\n• Use correct size\n• Avoid oil-based products with latex condoms',
    keywords: ['condom broke', 'condom tear', 'condom rip', 'accident', 'emergency'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'oral-sex-sti-risk',
    question: 'Can I get an STI from oral sex?',
    category: 'Sexual Health',
    answer: 'Yes, STIs can be transmitted through oral sex, though the risk varies by infection:\n\nHigher risk:\n• Gonorrhea (throat, "oral gonorrhea")\n• Herpes (HSV-1 and HSV-2 can transmit between mouth and genitals)\n• Syphilis (if sores present in mouth or on genitals)\n• Chlamydia (throat infection possible but less common)\n\nLower but possible risk:\n• HIV (lower risk than vaginal/anal sex, but possible if bleeding gums/sores)\n• HPV (can cause throat/oral cancer)\n• Hepatitis B\n\nMinimal risk:\n• Hepatitis C (very low risk through oral sex alone)\n\nRisk reduction:\n• Use condoms for oral sex on penis\n• Use dental dams for oral sex on vulva/vagina or anus\n• Avoid oral sex if you have cuts/sores in mouth\n• Avoid oral sex if partner has visible sores/symptoms\n• Get vaccinated (HPV, hepatitis B)\n• Regular STI testing including throat swabs if needed\n• Avoid brushing/flossing immediately before oral sex (can cause micro-cuts)\n\nNote: Many people don\'t use protection for oral sex, but it does carry STI risk. Discuss testing and safer sex practices with partners.',
    keywords: ['oral sex', 'blow job', 'cunnilingus', 'going down', 'mouth'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'prep-who-should-take',
    question: 'Who should take PrEP?',
    category: 'HIV & PrEP',
    answer: 'PrEP (pre-exposure prophylaxis) is recommended for people at higher risk of HIV. Consider PrEP if you:\n\nHave an HIV-positive partner:\n• Especially if their viral load is detectable or unknown\n• Even if they\'re on treatment, PrEP adds extra protection\n\nDon\'t consistently use condoms and:\n• Have multiple sexual partners\n• Have a partner with unknown HIV status\n• Have anal or vaginal sex\n\nHave had an STI in the past 6 months:\n• Indicates higher risk sexual activity\n• STIs increase HIV transmission risk\n\nInject drugs:\n• Share needles or drug preparation equipment\n• Have sexual partners who inject drugs\n\nAre a man who has sex with men (MSM):\n• Especially with multiple or anonymous partners\n• If partner status unknown\n\nEngage in sex work:\n• May not always be able to use condoms\n• Multiple or unknown partner status\n\nHow effective is PrEP?\n• Over 99% effective when taken daily as prescribed\n• Reduces risk by 99% for sexual transmission\n• Reduces risk by 74% for injection drug use\n\nAccessing PrEP in BC:\n• Free through BC PrEP Program\n• Requires prescription and regular monitoring\n• Blood tests every 3 months\n• Daily pill or injectable option (every 2 months)\n\nPrEP does NOT protect against other STIs - still use condoms and get regular testing.',
    keywords: ['prep', 'who should take', 'hiv prevention', 'truvada', 'pre-exposure'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'u-equals-u',
    question: 'What does U=U mean?',
    category: 'HIV & PrEP',
    answer: 'U=U stands for "Undetectable = Untransmittable"\n\nWhat it means:\nWhen a person living with HIV is on effective antiretroviral treatment (ART) and maintains an undetectable viral load for at least 6 months, they cannot sexually transmit HIV to their partners.\n\nKey facts:\n• Zero risk of sexual transmission when viral load is undetectable\n• Based on decades of research and large studies (PARTNER 1 & 2, Opposites Attract)\n• Applies to vaginal, anal, and oral sex\n• Must maintain treatment and regular viral load monitoring\n\nWhat "undetectable" means:\n• Viral load below 200 copies/mL (often below 40-50 copies/mL)\n• Achieved through consistent daily medication\n• Requires regular blood tests to confirm (every 3-6 months)\n\nImportant notes:\n• Takes at least 6 months of undetectable viral load to achieve U=U status\n• Must continue taking medication as prescribed\n• U=U applies to sexual transmission only - not to:\n  - Pregnancy/breastfeeding (consult healthcare provider)\n  - Sharing needles\n  - Blood transfusions\n• Does NOT protect against other STIs - still need condoms and testing\n• Regular medical follow-up is essential\n\nU=U is a game-changer:\n• Reduces stigma around HIV\n• Allows HIV-positive people to have healthy sex lives\n• Eliminates transmission risk in serodiscordant relationships\n• Encourages people to get tested and treated\n\nTreatment as Prevention (TasP):\nU=U is part of "Treatment as Prevention" - treating HIV not only keeps people healthy but also prevents transmission.',
    keywords: ['u=u', 'undetectable', 'untransmittable', 'viral load', 'hiv transmission'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'birth-control-methods',
    question: 'What birth control methods are available in BC?',
    category: 'Birth Control',
    answer: 'BC offers many birth control options, with free coverage for people under 25:\n\nHormonal Methods:\n\nThe Pill (oral contraceptive):\n• 91% effective with typical use, 99% with perfect use\n• Take daily at same time\n• Free for under 25 in BC\n\nThe Patch:\n• 91% effective with typical use\n• Change weekly (3 weeks on, 1 week off)\n• Free for under 25\n\nVaginal Ring (NuvaRing):\n• 91% effective with typical use\n• Insert for 3 weeks, remove for 1 week\n• Free for under 25\n\nInjection (Depo-Provera):\n• 94% effective with typical use\n• Shot every 3 months\n• Free for under 25\n\nLong-Acting Methods (LARC):\n\nIUD (Intrauterine Device):\n• Hormonal (Mirena, Kyleena): 99% effective, lasts 3-7 years\n• Copper (non-hormonal): 99% effective, lasts 3-12 years\n• Free for under 25 in BC\n• Can be used as emergency contraception\n\nImplant (Nexplanon):\n• 99% effective\n• Lasts 3 years\n• Inserted in arm\n• Free for under 25\n\nBarrier Methods:\n\nCondoms (external):\n• 85% effective with typical use, 98% with perfect use\n• Only method that prevents STIs\n• Available free at clinics, or purchase at stores\n\nCondoms (internal):\n• 79% effective with typical use\n• Also prevents STIs\n• Can be inserted hours before sex\n\nDiaphragm/Cervical Cap:\n• 88% effective with typical use\n• Must be fitted by healthcare provider\n• Use with spermicide\n\nEmergency Contraception:\n\nPlan B/Next Choice (levonorgestrel):\n• Take within 72 hours (sooner is better)\n• Available over-the-counter\n• Free at many clinics\n\nElla (ulipristal):\n• Effective up to 5 days\n• Requires prescription\n\nCopper IUD:\n• Most effective emergency contraception\n• Insert within 7 days\n• Can keep as ongoing birth control\n\nPermanent Methods:\n\nTubal Ligation (getting tubes tied)\nVasectomy\n\nAccessing Birth Control:\n• Sexual health clinics (confidential, often free)\n• Family doctor\n• Walk-in clinics\n• Pharmacists (can prescribe in BC)\n• Options BC for youth (free, confidential)\n\nCost: Free for people under 25 through BC Contraception Access Program. Others may have coverage through PharmaCare or private insurance.',
    keywords: ['birth control', 'contraception', 'the pill', 'iud', 'condom', 'prevent pregnancy'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'plan-b-how-it-works',
    question: 'How does Plan B work and how effective is it?',
    category: 'Birth Control',
    answer: 'Plan B (emergency contraception) prevents pregnancy after unprotected sex.\n\nHow it works:\n• Delays or prevents ovulation (release of egg)\n• May prevent sperm from fertilizing an egg\n• Does NOT cause abortion - won\'t work if already pregnant\n• Does NOT affect existing pregnancy\n\nEffectiveness:\n• Most effective within 24 hours (95% effective)\n• 85% effective within 72 hours\n• Effectiveness decreases over time\n• Less effective if you\'ve already ovulated\n• May be less effective if BMI over 25 (consider Ella or copper IUD)\n\nWhen to take it:\n• Condom broke or slipped off\n• Missed birth control pills\n• Didn\'t use contraception\n• Sexual assault\n• Any unprotected sex when pregnancy is not desired\n\nHow to get it:\n• Available over-the-counter at pharmacies (no prescription needed)\n• Free at sexual health clinics\n• Free at many walk-in clinics\n• Available at emergency departments\n• No age restriction in BC\n\nSide effects (usually mild):\n• Nausea\n• Fatigue\n• Headache\n• Dizziness\n• Breast tenderness\n• Irregular bleeding\n• Earlier or later period\n\nAfter taking Plan B:\n• Period may come early or late\n• Take a pregnancy test if period is more than 7 days late\n• Can use regular birth control immediately\n• Doesn\'t protect against future unprotected sex\n• Use condoms or other contraception until period arrives\n\nAlternatives:\n\nElla (ulipristal acetate):\n• More effective than Plan B\n• Works up to 5 days (120 hours)\n• More effective at higher BMIs\n• Requires prescription\n\nCopper IUD:\n• Most effective emergency contraception (99%)\n• Can insert up to 7 days after unprotected sex\n• Can keep as ongoing birth control\n• Lasts 3-12 years\n\nImportant:\n• Plan B does NOT protect against STIs\n• Consider STI testing after unprotected sex\n• Consider PEP if risk of HIV exposure',
    keywords: ['plan b', 'emergency contraception', 'morning after pill', 'levonorgestrel'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'pregnancy-test-when',
    question: 'When should I take a pregnancy test?',
    category: 'Pregnancy',
    answer: 'Timing matters for accurate pregnancy test results.\n\nBest time to test:\n• Wait until the first day of your missed period (most accurate)\n• Home tests detect pregnancy hormone (hCG) in urine\n• Testing too early can give false negative\n\nEarliest you can test:\n• Some sensitive tests can detect pregnancy 7-10 days after conception\n• Conception occurs about 2 weeks before expected period\n• "Early detection" tests may work 5-6 days before missed period\n• However, waiting until missed period is more reliable\n\nFirst response (most sensitive):\n• Can detect pregnancy earlier\n• Test with first morning urine (most concentrated)\n• Follow package instructions carefully\n\nIf test is negative but period doesn\'t come:\n• Wait 3-7 days and test again\n• Stress, illness, or hormonal changes can delay periods\n• If still negative and no period, see healthcare provider\n\nIf test is positive:\n• See healthcare provider to confirm and discuss options\n• Decide if you want to continue pregnancy\n• Start prenatal care if continuing pregnancy\n• Discuss pregnancy termination if not continuing\n\nBlood tests (at clinic/hospital):\n• More sensitive than home tests\n• Can detect pregnancy earlier (7-12 days after conception)\n• Can measure exact hCG levels\n• Results in 1-2 days\n\nWhere to get tests:\n• Purchase at pharmacy, grocery store, dollar store (all equally effective)\n• Free at sexual health clinics\n• Free at pregnancy support centers\n• Family doctor can order blood test\n\nAfter emergency contraception:\n• Plan B can delay period\n• Test if period is 7+ days late\n• Can test 3 weeks after unprotected sex for definitive result\n\nAfter abortion/miscarriage:\n• Pregnancy hormone can stay in body for weeks\n• Follow healthcare provider instructions\n• May need blood test to monitor hCG levels\n\nFalse results:\n\nFalse negative (test says not pregnant but you are):\n• Testing too early\n• Diluted urine (drinking lots of water)\n• Not following test instructions\n• Expired test\n\nFalse positive (rare):\n• Recent pregnancy loss\n• Certain medications\n• Rare medical conditions\n• Evaporation line (faint line appearing after time limit)',
    keywords: ['pregnancy test', 'when to test', 'missed period', 'am i pregnant'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'lgbtq-friendly-care',
    question: 'How do I find LGBTQ2S+ friendly sexual health care?',
    category: 'LGBTQ2S+',
    answer: 'Finding affirming, knowledgeable sexual health care is important for LGBTQ2S+ people.\n\nWhat to look for:\n• Use of correct pronouns and chosen name\n• Inclusive intake forms (pronouns, gender identity, sexual orientation)\n• Asking about anatomy rather than assuming based on gender\n• Knowledge about LGBTQ2S+ specific health needs\n• No assumptions about sexual practices or partners\n• Trans-competent care\n• Welcoming, non-judgmental environment\n\nWhere to find LGBTQ2S+ friendly care in BC:\n\nSpecialized Clinics:\n• Three Bridges Community Health Centre (Vancouver) - LGBTQ2S+ focus\n• QMUNITY (Vancouver) - support and health resource referrals\n• Vancouver Coastal Health Sexual Health Clinics - LGBTQ2S+ friendly\n• REACH Community Health Centre (Vancouver)\n• Island Sexual Health (Victoria and Vancouver Island)\n• Central Okanagan Youth Services Society (Kelowna)\n\nSexual Health Clinics:\n• Most sexual health clinics in BC are LGBTQ2S+ affirming\n• Staff trained in inclusive care\n• Confidential services\n• No judgment about sexual practices or identity\n\nOnline Resources:\n• Trans Care BC - resources and provider directory\n• PHSA (Provincial Health Services Authority) - Rainbow Health resources\n• QMUNITY online resources\n\nWhat to ask when choosing a provider:\n• "Do you have experience working with LGBTQ2S+ patients?"\n• "Are you familiar with [specific concern, e.g., hormone therapy, PrEP]?"\n• "Will you use my correct name and pronouns?"\n• "Do your intake forms include gender identity and pronouns?"\n\nSpecific health considerations:\n\nFor trans and non-binary people:\n• Cervical screening if you have a cervix (regardless of gender identity)\n• Prostate health if you have a prostate\n• Hormone therapy monitoring\n• Mental health support during transition\n• Fertility preservation options\n\nFor men who have sex with men (MSM):\n• Regular STI testing including rectal and throat swabs\n• PrEP for HIV prevention\n• HPV and hepatitis A/B vaccination\n• Every 3-6 month testing for sexually active MSM\n\nFor women who have sex with women:\n• Yes, STIs can transmit between women\n• Cervical screening still needed\n• Barrier methods (dental dams) for oral sex\n• Clean sex toys or use barriers\n\nFor people with multiple or diverse partners:\n• Open communication with providers about all partners\n• Tailored testing based on practices (oral, anal, vaginal)\n• Multiple site testing if needed\n\nYour rights:\n• Right to be addressed by correct name and pronouns\n• Right to bring support person\n• Right to decline students or observers\n• Right to see different provider if uncomfortable\n• Right to file complaint if discriminated against\n\nIf you experience discrimination:\n• Ask to see different provider\n• Contact clinic manager\n• File complaint with BC College of Physicians and Surgeons\n• Reach out to LGBTQ2S+ organizations for support',
    keywords: ['lgbtq', 'trans', 'gay', 'lesbian', 'queer', 'non-binary', 'transgender', 'msm'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'can-get-sti-from-sex-toy',
    question: 'Can I get an STI from sharing sex toys?',
    category: 'Sexual Health',
    answer: 'Yes, STIs can be transmitted by sharing sex toys.\n\nHow transmission occurs:\n• Bodily fluids (vaginal fluids, semen, blood) stay on toys\n• Bacteria and viruses can survive on surfaces\n• Direct contact between toy and mucous membranes\n• Micro-tears in vaginal/anal tissue\n\nSTIs that can transmit via sex toys:\n• Chlamydia\n• Gonorrhea\n• Trichomoniasis\n• Herpes (HSV)\n• HPV\n• Hepatitis B and C (if blood present)\n• Bacterial vaginosis\n• HIV (low risk, mainly if blood present)\n\nHow to use sex toys safely:\n\nIf not sharing:\n• Clean before and after each use\n• Follow manufacturer cleaning instructions\n• Use mild soap and warm water, or sex toy cleaner\n• Let air dry completely\n• Store in clean, dry place\n\nIf sharing between partners:\n\nOption 1 - Use barriers:\n• Put a new condom on toy before each person uses it\n• Change condom between partners\n• Change condom between vaginal and anal use\n• Use condoms on dildos, vibrators, plugs\n\nOption 2 - Clean thoroughly between uses:\n• Wash with soap and hot water between partners\n• Use sex toy cleaner\n• Some toys can be boiled (check manufacturer instructions)\n• Some silicone toys are dishwasher safe\n\nOption 3 - Don\'t share:\n• Each person has their own toys\n• Label toys if living together\n\nSpecial considerations:\n\nMaterial matters:\n• Non-porous materials (silicone, glass, metal) - easier to clean\n• Porous materials (jelly, rubber, cyberskin) - can harbor bacteria, hard to fully clean\n• Choose body-safe, non-porous materials when possible\n\nType of use:\n• Vaginal to anal: Never without cleaning or changing barrier\n• Multiple partners: Always use barriers or clean between\n• Solo use: Clean after each use\n\nDamaged toys:\n• Cracks or tears can harbor bacteria\n• Replace if damaged\n• Inspect regularly\n\nLubricant:\n• Use water-based lube with silicone toys\n• Use silicone or water-based lube with latex condoms on toys\n• Don\'t use oil-based lube with latex condoms\n\nBottom line:\n• Sex toys can transmit STIs if shared\n• Use condoms on shared toys OR clean thoroughly between uses\n• Choose non-porous, body-safe materials\n• When in doubt, use a barrier\n\nRegular STI testing is still important regardless of safer sex toy practices.',
    keywords: ['sex toy', 'vibrator', 'dildo', 'sharing', 'clean'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  },
  {
    id: 'partner-has-sti',
    question: 'My partner has an STI - what should I do?',
    category: 'Sexual Health',
    answer: 'If your partner has an STI, here are important steps to take:\n\nImmediate actions:\n\n1. Get tested:\n• Get tested even if you have no symptoms\n• Many STIs are asymptomatic\n• Test for the same STI your partner has\n• Consider comprehensive STI panel\n• Partner notification programs can help (confidential)\n\n2. Avoid sexual contact:\n• No sexual contact until both treated and cleared\n• Includes oral, vaginal, and anal sex\n• Can reinfect each other ("ping-pong" infection)\n\n3. See healthcare provider:\n• May offer presumptive treatment (treat you before test results)\n• Discuss your exposure and symptoms\n• Get advice on testing timeline\n\n4. Inform other partners:\n• Anyone you\'ve had sex with since your last negative test\n• Public health can help with anonymous notification\n• Partner notification is confidential\n\nTreatment:\n\nIf you test positive:\n• Take all medication as prescribed\n• Complete full course even if symptoms improve\n• No sexual contact until treatment complete\n• Partner(s) must also be treated\n• Retest after treatment (3 months for most STIs)\n\nIf you test negative:\n• May still need to retest after window period\n• Continue avoiding sexual contact until partner treated\n• Use condoms consistently\n• Consider retesting in 3 months\n\nPrevention going forward:\n\n1. Wait until both treated:\n• Both complete treatment\n• Both test negative (if applicable)\n• Follow healthcare provider guidance\n\n2. Use protection:\n• Use condoms consistently\n• Consider other barriers (dental dams)\n\n3. Regular testing:\n• Test together before unprotected sex\n• Regular testing if sexually active\n• Test with new partners\n\n4. Communication:\n• Be open about STI status\n• Discuss testing history\n• Make testing part of relationship routine\n\nSpecific STI considerations:\n\nCurable STIs (chlamydia, gonorrhea, syphilis, trich):\n• Both partners must be treated\n• Wait 7 days after treatment before sex\n• Retest in 3 months\n• Can get reinfected if exposed again\n\nHerpes:\n• Not curable but manageable\n• Antiviral medication reduces outbreaks and transmission\n• Avoid sex during outbreaks\n• Can transmit even without symptoms (use condoms)\n• Disclosure important in relationships\n\nHIV:\n• Partner should start treatment immediately\n• U=U (undetectable = untransmittable) with treatment\n• Consider PrEP for HIV-negative partner\n• Condoms provide additional protection\n• Regular testing for HIV-negative partner\n\nHPV:\n• Very common, usually clears on own\n• Vaccine available (Gardasil 9)\n• No test for HPV in penis\n• Regular cervical screening if you have cervix\n• Condoms reduce but don\'t eliminate risk\n\nEmotional support:\n• STIs are common and treatable\n• Not a moral failing\n• Doesn\'t mean partner cheated (can have had it before relationship)\n• Some STIs can be dormant for months/years\n• Focus on health, not blame\n• Seek counseling if needed\n\nRelationship considerations:\n• Have honest, non-judgmental conversation\n• Discuss how/when infection occurred\n• STI could be from before relationship\n• Focus on moving forward together\n• Respect if partner needs time to process\n\nYour rights:\n• Right to know partner\'s STI status\n• Right to insist on protection\n• Right to end relationship if trust broken\n• Right to support and non-judgmental care\n\nPublic Health support:\n• Can help with partner notification (anonymous)\n• Provides counseling\n• Ensures partners get treated\n• Prevents further spread',
    keywords: ['partner has sti', 'boyfriend', 'girlfriend', 'exposed', 'partner tested positive'],
    source_url: 'https://smartsexresource.com/answered-questions/'
  }
];

// Search FAQs by keywords
export function searchFAQs(query: string): FAQ[] {
  const normalized = query.toLowerCase();
  const matches: Array<{ faq: FAQ; score: number }> = [];

  FAQS.forEach(faq => {
    let score = 0;
    
    // Check if question matches
    if (faq.question.toLowerCase().includes(normalized)) {
      score += 10;
    }
    
    // Check keywords
    faq.keywords.forEach(keyword => {
      if (normalized.includes(keyword.toLowerCase())) {
        score += 5;
      }
    });
    
    // Check category
    if (normalized.includes(faq.category.toLowerCase())) {
      score += 3;
    }

    if (score > 0) {
      matches.push({ faq, score });
    }
  });

  // Sort by relevance score
  matches.sort((a, b) => b.score - a.score);
  
  return matches.slice(0, 3).map(m => m.faq);
}

// Get FAQ by ID
export function getFAQById(id: string): FAQ | undefined {
  return FAQS.find(faq => faq.id === id);
}

// Get FAQs by category
export function getFAQsByCategory(category: string): FAQ[] {
  return FAQS.filter(faq => faq.category === category);
}

// Get random FAQs for suggestions
export function getRandomFAQs(count: number = 3): FAQ[] {
  const shuffled = [...FAQS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
