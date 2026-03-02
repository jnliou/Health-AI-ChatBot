// Teen-Friendly Contraception FAQs for BC
// Using HealthLinkBC and SmartSexResource information

export interface ContraceptionFAQ {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  sources: { label: string; url: string }[];
}

export const CONTRACEPTION_FAQS: ContraceptionFAQ[] = [
  {
    id: "confidential-access",
    question:
      "Can I get birth control without my parents knowing?",
    keywords: [
      "without",
      "parents",
      "knowing",
      "permission",
      "telling",
      "consent",
      "confidential",
    ],
    answer: `**Confidential Access to Birth Control in BC**

**Yes, you can get birth control without parental consent or notification in BC.**

In British Columbia:
• **Age of consent for medical care**: If a healthcare provider determines you understand the treatment and its risks/benefits (called "mature minor consent"), you can consent to your own healthcare - including birth control - at any age
• **Confidentiality is protected**: Healthcare providers cannot tell your parents without your permission
• **Free and low-cost options**: Sexual health clinics provide contraception at no cost and with complete privacy

**Where to access confidential services:**
• **Sexual health clinics** - Youth-friendly, confidential, often free
• **Walk-in clinics** - Can see you without parental involvement
• **School-based clinics** - Some schools have confidential health services
• **Pharmacists** - Can provide emergency contraception (Plan B) without ID or parental consent

**What to expect:**
1. Healthcare providers will assess your understanding (mature minor consent)
2. They'll explain your options and help you choose what's right for you
3. Everything you discuss is confidential
4. You can bring a trusted friend or support person if that helps

**Important:** Emergency contraception (Plan B) is available over-the-counter at any pharmacy - no prescription, ID, or parental permission needed.

Would you like help finding a youth-friendly sexual health clinic near you?`,
    sources: [
      {
        label: "SmartSexResource - Clinic Finder",
        url: "https://smartsexresource.com/clinics-testing/",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control",
      },
    ],
  },
  {
    id: "iud-teen-safety",
    question: "Is the IUD safe for teens?",
    keywords: [
      "teen",
      "young",
      "teenager",
      "safe for me",
      "iud",
      "adolescent",
    ],
    answer: `**IUDs for Teens and Young People**

**Yes, IUDs are safe and recommended for teens and people who haven't had children.**

The Canadian Paediatric Society and BC health guidelines confirm:
• IUDs are safe and effective for adolescents
• You DO NOT need to have had a baby first
• Both hormonal and copper IUDs are options for teens
• One of the most effective forms of birth control (99%+)

**Benefits for teens:**
• "Set it and forget it" - no daily pill to remember
• Lasts 3-10 years (depending on type)
• Reversible - can be removed anytime
• Very low maintenance
• Doesn't interfere with sports, activities, or daily life
• Can help with heavy or painful periods (hormonal IUD)

**Common myths (all FALSE):**
❌ "You need to have had a baby first" - Not true
❌ "It will make you infertile" - Not true, fertility returns immediately after removal
❌ "Insertion is too painful for teens" - Similar discomfort to period cramps; numbing options available
❌ "It will fall out easily" - Very rare (less than 5%)

**What to expect:**
1. Consult with a healthcare provider at a sexual health clinic
2. Discuss which type (hormonal vs. copper) is right for you
3. Insertion appointment (5-15 minutes)
4. Some cramping for a day or two
5. Follow-up to check placement

**Cost in BC:**
• Free at sexual health clinics
• Covered by BC PharmaCare
• Most insurance plans cover

**Confidential:** You can get an IUD without parental consent if you're deemed a mature minor.

Would you like more information about the insertion process or help finding a clinic?`,
    sources: [
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control",
      },
    ],
  },
  {
    id: "missed-pill",
    question: "What if I miss a pill?",
    keywords: [
      "miss",
      "missed",
      "forgot",
      "forget",
      "pill",
      "birth control",
    ],
    answer: `**What to Do If You Miss a Birth Control Pill**

**For Combined Pills (estrogen + progestin):**

**Missed 1 pill:**
• Take it as soon as you remember (even if it means taking 2 pills in one day)
• Continue taking pills at your regular time
• No backup contraception needed
• You're still protected

**Missed 2 pills in a row:**
• Take 2 pills the day you remember
• Take 2 pills the next day
• Use backup contraception (condoms) for the next 7 days
• If you had unprotected sex in the past 5 days, consider emergency contraception

**Missed 3+ pills:**
• Start a new pack or continue with current pack (depending on when in cycle)
• Use backup contraception for 7 days
• Consider emergency contraception if you had recent unprotected sex
• Contact a healthcare provider or pharmacist for guidance

**For Progestin-Only Pills (Mini-Pill):**
• **More time-sensitive** - must be taken within same 3-hour window daily
• If more than 3 hours late: Use backup contraception for 48 hours
• If you had sex in past 5 days, consider emergency contraception

**Special situations:**
• **Vomiting within 2 hours of taking pill**: Take another pill
• **Severe diarrhea**: May affect absorption; use backup contraception
• **Taking antibiotics or other medications**: Some can reduce effectiveness - ask your pharmacist

**When to use emergency contraception:**
• Missed 2+ pills and had unprotected sex in the past 5 days
• Plan B is available over-the-counter at pharmacies (no prescription needed)
• ella (more effective) requires prescription
• Copper IUD (most effective) available at clinics within 7 days

**Need help?**
• Call HealthLinkBC: 8-1-1 (24/7 nurse advice)
• Contact your pharmacy
• Visit a sexual health clinic

Would you like information about emergency contraception or other birth control options?`,
    sources: [
      {
        label: "HealthLinkBC - Hormonal Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/hormonal-methods-birth-control",
      },
      {
        label: "HealthLinkBC - Birth Control Pills",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control-hormones-pill",
      },
    ],
  },
  {
    id: "bc-sti-protection",
    question: "Can birth control prevent STIs?",
    keywords: [
      "prevent",
      "protect",
      "sti",
      "std",
      "birth control",
      "pill",
      "iud",
    ],
    answer: `**Birth Control and STI Protection**

**Important: Most birth control methods do NOT protect against STIs.**

**What protects against STIs:**
✅ **External (male) condoms** - Protect against most STIs including HIV, chlamydia, gonorrhea
✅ **Internal (female) condoms** - Protect against most STIs
✅ **Dental dams** - For oral sex on vulva or anus
✅ **Regular testing** - Know your status and your partners'

**What does NOT protect against STIs:**
❌ Birth control pills
❌ IUDs (copper or hormonal)
❌ The patch
❌ Vaginal ring
❌ Depo-Provera injection
❌ Contraceptive implant
❌ Emergency contraception (Plan B, ella)
❌ Withdrawal ("pulling out")
❌ Fertility awareness methods

**Dual Protection Strategy:**
**Use condoms + another birth control method for:**
• Maximum pregnancy prevention (condoms can break/slip)
• STI protection
• Peace of mind

Example: Birth control pill + condoms = protected from both pregnancy AND STIs

**Partial protection (better than nothing):**
• Condoms reduce risk of HPV and herpes, but these can spread through skin-to-skin contact in areas not covered by condoms

**Other ways to reduce STI risk:**
• Get tested regularly (especially with new partners)
• Talk to partners about STI status before sex
• Get vaccinated (HPV, Hepatitis A & B)
• Consider PrEP if at higher risk for HIV
• Limit number of sexual partners

**Remember:** You can use condoms even if you're on other birth control. It's called "dual protection" and it's the best way to protect against both pregnancy and STIs.

Would you like information about where to get free condoms in BC, or STI testing locations?`,
    sources: [
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control",
      },
      {
        label: "SmartSexResource - STI Basics",
        url: "https://smartsexresource.com/sexually-transmitted-infections/sti-basics/",
      },
      {
        label: "SmartSexResource - Prevention",
        url: "https://smartsexresource.com/prevention/",
      },
    ],
  },
  {
    id: "condom-broke",
    question: "What should I do if the condom broke?",
    keywords: [
      "condom",
      "broke",
      "broken",
      "ripped",
      "tore",
      "slipped",
      "emergency",
    ],
    answer: `**What to Do If a Condom Breaks or Slips**

**Take a breath - you have options. Here's what to do:**

**Step 1: Pregnancy Prevention**

**Consider Emergency Contraception (EC):**
• **Plan B** - Available over-the-counter at pharmacies, no prescription or ID needed
  - Most effective within 24 hours
  - Can work up to 5 days (120 hours) after sex
  - Cost: ~$15-45
• **ella** - Requires prescription, more effective than Plan B especially days 3-5
• **Copper IUD** - Most effective option (99%+), must be inserted within 7 days

**Timeline matters:**
• The sooner you take EC, the more effective it is
• Don't wait - Plan B is available right now at any pharmacy

**Step 2: STI Protection**

**Consider getting tested:**
• **If you don't know your partner's STI status**, testing is recommended
• Most STIs have a "window period" before tests are accurate:
  - Chlamydia & Gonorrhea: Test after 2 weeks
  - HIV: Test at 6 weeks and 3 months
  - Syphilis: Test at 6 weeks and 3 months

**If concerned about HIV specifically:**
• **PEP (Post-Exposure Prophylaxis)** - Emergency medication that can prevent HIV
• Must start within **72 hours** (sooner is better)
• Available at emergency departments and some sexual health clinics
• Free or low-cost in BC

**Step 3: Follow-up**

• Take a pregnancy test if your period is late (3+ weeks after incident)
• Get tested for STIs at appropriate window periods
• Consider more reliable birth control methods for future protection

**Where to go:**
• **Pharmacies** - Plan B, no appointment needed
• **Sexual health clinics** - Testing, EC, IUD, confidential care
• **Emergency department** - If within 72 hours and concerned about HIV (for PEP)
• **Walk-in clinics** - ella prescription, testing

**Need immediate help?**
• HealthLinkBC: Call 8-1-1 for 24/7 nurse advice
• Sexual health clinic finder: I can help you locate one

Would you like help finding emergency contraception or a testing clinic near you?`,
    sources: [
      {
        label: "SmartSexResource - Clinics & Testing",
        url: "https://smartsexresource.com/clinics-testing/",
      },
      {
        label: "HealthLinkBC - Emergency Contraception",
        url: "https://www.healthlinkbc.ca/healthlinkbc-files/emergency-contraception",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control",
      },
    ],
  },
  {
    id: "bc-cost-free",
    question: "Is birth control free in BC?",
    keywords: [
      "free",
      "cost",
      "price",
      "pay",
      "afford",
      "birth control",
      "contraception",
    ],
    answer: `**Birth Control Coverage in BC**

**Yes, birth control is free or low-cost in BC!**

**Free at Sexual Health Clinics:**
• Birth control pills
• IUDs (copper and hormonal)
• Depo-Provera injection
• Condoms
• Emergency contraception
• No fees, no billing, confidential

**BC PharmaCare Coverage:**

As of **April 1, 2023**, BC covers prescription contraceptives for anyone with a BC Care Card, including:
• Birth control pills
• Hormonal IUDs (Mirena, Kyleena, Jaydess)
• Copper IUD
• Contraceptive patch
• Vaginal ring (NuvaRing)
• Depo-Provera injection
• Contraceptive implant

**You pay $0** if you have:
• Fair PharmaCare
• Income assistance
• MSP Premium Assistance

**What's NOT covered:**
• Condoms (but free at sexual health clinics and some community health centers)
• Over-the-counter emergency contraception like Plan B (but may be covered with prescription)

**How to Access Free Birth Control:**

**Option 1: Sexual Health Clinics (Easiest)**
• Walk in or book appointment
• Get prescription and contraception same day
• Everything is free
• Confidential (even if you're under 19)

**Option 2: Pharmacy with BC PharmaCare**
• Get prescription from doctor or clinic
• Take to pharmacy
• Show BC Care Card
• $0 cost (or very low cost depending on coverage)

**Option 3: Family Doctor**
• Get prescription
• Covered by PharmaCare

**Emergency Contraception:**
• **Plan B**: ~$15-45 at pharmacies (over-the-counter)
• **ella**: Free with BC PharmaCare (requires prescription)
• **Copper IUD**: Free at sexual health clinics

**Need help finding a clinic?**
I can help you locate a sexual health clinic that provides free contraception near you.

Would you like help finding a clinic or information about a specific birth control method?`,
    sources: [
      {
        label: "BC PharmaCare - Contraceptive Coverage",
        url: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover/prescription-contraceptives",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control",
      },
      {
        label: "SmartSexResource - Clinics",
        url: "https://smartsexresource.com/clinics-testing/",
      },
    ],
  },
  {
    id: "plan-b-prescription",
    question: "Do I need a prescription for Plan B?",
    keywords: [
      "prescription",
      "need",
      "get",
      "plan b",
      "emergency contraception",
      "morning after",
    ],
    answer: `**Getting Emergency Contraception in BC**

**Plan B (Levonorgestrel):**

❌ **No prescription needed**
❌ **No ID required**  
❌ **No age restriction**
❌ **No parental consent needed**

✅ **Available over-the-counter** at any pharmacy in BC

Just walk into any pharmacy and ask the pharmacist for Plan B (or the generic "levonorgestrel"). They may ask you a few questions to help you use it correctly, but they cannot refuse to sell it to you.

**Cost:** ~$15-45 depending on pharmacy and brand (generic is cheaper)

**Other Emergency Contraception Options:**

**ella (Ulipristal Acetate):**
• ✅ Requires prescription (from doctor, clinic, or pharmacist in some cases)
• More effective than Plan B, especially days 3-5 after sex
• Covered by BC PharmaCare (free with prescription)

**Copper IUD:**
• Most effective emergency contraception (99%+)
• Must be inserted by healthcare provider within 7 days
• Free at sexual health clinics
• Can stay in place for ongoing birth control (up to 10 years)

**Where to Get Emergency Contraception:**

**Plan B:**
• Any pharmacy (Shoppers Drug Mart, London Drugs, Walmart, etc.)
• Some convenience stores
• Sexual health clinics (often free)

**ella:**
• Sexual health clinics (free)
• Doctor or walk-in clinic (prescription → free at pharmacy with BC Care Card)

**Copper IUD:**
• Sexual health clinics
• Doctor's office (if they do IUD insertions)

**Important:**
• The sooner you take EC, the more effective it is
• Plan B works best within 24 hours but can work up to 5 days
• You can take Plan B more than once (though it's not meant for regular birth control)
• EC does NOT protect against STIs - consider testing if needed

**Need help finding a pharmacy or clinic open right now?**
• Call HealthLinkBC: 8-1-1 (24/7)
• Or I can help you find the nearest clinic

Would you like help finding emergency contraception near you?`,
    sources: [
      {
        label: "HealthLinkBC - Emergency Contraception",
        url: "https://www.healthlinkbc.ca/healthlinkbc-files/emergency-contraception",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control",
      },
    ],
  },
  {
    id: "choosing-method",
    question:
      "How do I know which birth control is right for me?",
    keywords: [
      "which",
      "what",
      "choose",
      "right for me",
      "best",
      "birth control",
    ],
    answer: `**Choosing the Right Birth Control**

There's no one "best" method - the right choice depends on **your** body, lifestyle, and preferences.

**Questions to ask yourself:**

**1. How important is preventing pregnancy?**
• **Most effective (99%+)**: IUD, implant, sterilization
• **Very effective (91-99%)**: Pill, patch, ring, injection
• **Moderately effective (85-98%)**: Condoms, diaphragm

**2. Do you want to remember something daily?**
• **Daily**: The pill
• **Weekly**: The patch
• **Monthly**: Vaginal ring
• **Every 3 months**: Depo-Provera injection
• **Every 3-10 years**: IUD or implant ("set it and forget it")

**3. Do you want hormones or not?**
• **Hormonal**: Pill, patch, ring, injection, implant, hormonal IUD
• **Non-hormonal**: Copper IUD, condoms, diaphragm, fertility awareness

**4. Do you need STI protection?**
• **Only condoms protect against STIs**
• Consider "dual protection": condoms + another method

**5. How do you feel about your period?**
• **Want to reduce/stop periods**: Hormonal IUD, continuous-use pill, implant
• **Want regular periods**: Combined pill, patch, ring
• **May have heavier periods**: Copper IUD (at first)

**6. Any medical conditions?**
• **Migraines with aura**: Avoid estrogen (use progestin-only methods)
• **History of blood clots**: Avoid estrogen
• **Breastfeeding**: Progestin-only methods are safe
• **Certain medications**: May interact with hormonal birth control

**7. Cost and access?**
• **Free at sexual health clinics**: Pills, IUDs, injection, condoms
• **Covered by BC PharmaCare**: Most prescription contraceptives

**Quick Comparison:**

**Best for:** "I don't want to think about it"
→ **IUD or implant** (lasts years, most effective)

**Best for:** "I want control over when I take it"
→ **The pill** (can stop anytime, helps with periods)

**Best for:** "I can't use hormones"
→ **Copper IUD** (lasts 10 years, non-hormonal)

**Best for:** "I need STI protection too"
→ **Condoms** (+ another method for pregnancy prevention)

**Best for:** "I forget to take pills"
→ **Patch, ring, injection, or IUD**

**Next Steps:**

1. **Talk to a healthcare provider** at a sexual health clinic - they can help you decide based on your health history
2. **Try a method** - you can always switch if it doesn't work for you
3. **Use condoms too** if you need STI protection

**Where to get personalized advice:**
• Sexual health clinics (confidential, youth-friendly)
• HealthLinkBC: Call 8-1-1
• Your family doctor

Would you like more information about a specific method, or help finding a clinic to discuss your options?`,
    sources: [
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/healthwise/birth-control",
      },
      {
        label: "HealthLinkBC - Birth Control",
        url: "https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control",
      },
    ],
  },
];

// Search function for contraception FAQs
export function searchContraceptionFAQs(
  query: string,
): ContraceptionFAQ | null {
  const lowerQuery = query.toLowerCase();
  const genericKeywords = new Set([
    "contraception",
    "birth control",
    "birth",
    "control",
    "method",
    "methods",
    "option",
    "options",
  ]);

  let bestMatch: ContraceptionFAQ | null = null;
  let bestScore = 0;
  const intentGuards: Record<string, string[]> = {
    "missed-pill": ["miss", "missed", "forgot", "forget", "late"],
    "bc-cost-free": ["free", "cost", "price", "pay", "coverage", "pharmacare"],
    "plan-b-emergency": ["plan b", "emergency", "morning after", "ella"],
  };

  for (const faq of CONTRACEPTION_FAQS) {
    const guardTerms = intentGuards[faq.id];
    if (guardTerms && !guardTerms.some((term) => lowerQuery.includes(term))) {
      continue;
    }

    const matchedKeywords = faq.keywords.filter((keyword) =>
      lowerQuery.includes(keyword.toLowerCase()),
    );
    const matchCount = matchedKeywords.length;
    const hasSpecificMatch = matchedKeywords.some(
      (k) => k.length > 8 && !genericKeywords.has(k.toLowerCase()),
    );
    const score = matchCount * 10 + (hasSpecificMatch ? 3 : 0);

    // Match if at least 2 keywords, or 1 specific non-generic keyword.
    if (
      matchCount >= 2 ||
      (matchCount === 1 && hasSpecificMatch)
    ) {
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }
  }

  return bestMatch;
}
