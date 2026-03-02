# FIGMA PROMPT — “Multilingual STI Resources” (SmartSexResource)

## Goal
When a user asks: “Provide resources in another language,” the prototype should:
1) Ask which **condition** and **language** they need,
2) Return the **single** best link for that language (prefer direct PDF when verified; otherwise the official SmartSexResource resource page),
3) Show a subtle **disclaimer + source**,
4) Keep the UI clean (no bulk lists) unless the user explicitly asks to see “all languages.”

---

## Conversation script (for the prototype)
**User utterance example**: “My mom wants to know about gonorrhea but she only reads Farsi.”

**System steps**  
1) Detect `topic` ∈ {chlamydia, gonorrhea, syphilis, hepatitis_b, hiv_aids, hpv}.  
2) Detect `language` from user text; if missing, prompt:  
   - “Which language do you need? (English, Arabic, Chinese – Simplified, Farsi, French, Korean, Punjabi, Spanish, Vietnamese*)”

3) Lookup `RESOURCES[topic]`. If `language` is supported and a **direct_pdf** exists, show that link.  
   If `direct_pdf` is `null`, show the **official page** for that topic with a note “Choose **{Language}** under Translations on the page.”

4) Render a compact card:  
   - Title: `{Topic Display Name} — {Language}`  
   - Primary CTA: “Open PDF” (if `direct_pdf`), else “Open official resource page”  
   - Secondary text: “From SmartSexResource (BCCDC)”  
   - Footnote: “Clinical info changes; use the latest official guidance.”  
   - Source link (tiny): “Source: SmartSexResource”

5) **Important:** Only show the **requested language**. Do not enumerate other languages unless the user asks “show all languages for {topic}.”

---

## Topics & language inventory (source of truth)

> Origin pages (official SmartSexResource):
> - Chlamydia Information Sheet (lists EN + AR + ZH‑Simplified + FA + FR + KO + PA + ES) [1](https://www.health.nsw.gov.au/Infectious/factsheets/Pages/chlamydia-translations/chinese-simplified.aspx)  
> - Gonorrhea Information Sheet (lists EN + AR + ZH‑Simplified + FA + FR + KO + PA + ES) [2](https://smartsexresource.com/answered-questions/)  
> - Syphilis page (English web article; SmartSexResource hosts a Farsi PDF from HealthLinkBC) [8](https://smartsexresource.com/wp-content/uploads/resources/Syphilis-HealthLinkBC-File-Farsi.pdf?x34059)[6](https://smartsexresource.com/resources/hepatitis-b-information-sheet/)  
> - Hepatitis B Information Sheet (HealthLinkBC)—EN + AR + ZH‑Traditional + FA + FR + KO + PA + ES + VI available via the SSR resource entry [4](https://helpstartshere.gov.bc.ca/resource/options-sexual-health-clinics)  
> - HIV & AIDS page—English PDF listed; translations not shown at SSR [5](https://www.vch.ca/en/service/sexual-health-clinics)  
> - HPV Information Sheet—EN + AR + ZH‑Simplified + FA + FR + KO + PA + ES (translated handouts noted as “pending review” at SSR, but the language set is defined on the resource page) [3](https://www.healthlinkbc.ca/healthwise/birth-control)

```json
{
  "META": {
    "publisher": "SmartSexResource (BC Centre for Disease Control)",
    "last_verified": "2026-02-28",
    "notes": "Prefer direct PDFs when verified at source; otherwise link to SSR resource page so users can pick the translation."
  },
  "RESOURCES": {
    "chlamydia": {
      "display": "Chlamydia",
      "source_page": "https://smartsexresource.com/resources/chlamydia-information-sheet/",
      "languages": {
        "English":        { "direct_pdf": null },
        "Arabic":         { "direct_pdf": null },
        "Chinese (Simplified)": { "direct_pdf": null },
        "Farsi":          { "direct_pdf": null },
        "French":         { "direct_pdf": null },
        "Korean":         { "direct_pdf": null },
        "Punjabi":        { "direct_pdf": null },
        "Spanish":        { "direct_pdf": null }
      },
      "source_citation": "turn7search44"
    },

    "gonorrhea": {
      "display": "Gonorrhea",
      "source_page": "https://smartsexresource.com/resources/gonorrhea-information-sheet/",
      "languages": {
        "English":        { "direct_pdf": "https://smartsexresource.com/wp-content/uploads/2023/03/SmartSex_Gonorrhea_Dec2022.pdf" },
        "Arabic":         { "direct_pdf": null },
        "Chinese (Simplified)": { "direct_pdf": null },
        "Farsi":          { "direct_pdf": null },
        "French":         { "direct_pdf": null },
        "Korean":         { "direct_pdf": null },
        "Punjabi":        { "direct_pdf": null },
        "Spanish":        { "direct_pdf": null }
      },
      "source_citation": "turn7search49;turn5search26"
    },

    "syphilis": {
      "display": "Syphilis",
      "source_page": "https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/syphilis/",
      "languages": {
        "English":        { "direct_pdf": null },
        "Farsi":          { "direct_pdf": "https://smartsexresource.com/wp-content/uploads/resources/Syphilis-HealthLinkBC-File-Farsi.pdf" }
      },
      "notes": "SSR provides English web content; only Farsi PDF is hosted by SSR via HealthLinkBC.",
      "source_citation": "turn7search37;turn5search27"
    },

    "hepatitis_b": {
      "display": "Hepatitis B",
      "source_page": "https://smartsexresource.com/resources/hepatitis-b-information-sheet/",
      "languages": {
        "English":        { "direct_pdf": null },
        "Arabic":         { "direct_pdf": null },
        "Chinese (Traditional)": { "direct_pdf": null },
        "Farsi":          { "direct_pdf": null },
        "French":         { "direct_pdf": null },
        "Korean":         { "direct_pdf": null },
        "Punjabi":        { "direct_pdf": null },
        "Spanish":        { "direct_pdf": null },
        "Vietnamese":     { "direct_pdf": null }
      },
      "notes": "This SSR entry points to HealthLinkBC PDFs; surface the SSR page and instruct user to select their language.",
      "source_citation": "turn7search63"
    },

    "hiv_aids": {
      "display": "HIV & AIDS",
      "source_page": "https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hiv-and-aids/",
      "languages": {
        "English":        { "direct_pdf": null }
      },
      "notes": "SSR lists an English PDF in the Resource Database; if needed, show the page and the PDF label to the user.",
      "source_citation": "turn7search62"
    },

    "hpv": {
      "display": "Human Papillomavirus (HPV)",
      "source_page": "https://smartsexresource.com/resources/hpv-information-sheet/",
      "languages": {
        "English":        { "direct_pdf": null },
        "Arabic":         { "direct_pdf": null },
        "Chinese (Simplified)": { "direct_pdf": null },
        "Farsi":          { "direct_pdf": null },
        "French":         { "direct_pdf": null },
        "Korean":         { "direct_pdf": null },
        "Punjabi":        { "direct_pdf": null },
        "Spanish":        { "direct_pdf": null }
      },
      "notes": "SSR marks translations as 'pending review' but surfaces language options; link to page and let user choose.",
      "source_citation": "turn7search53"
    }
  },

  "UX_COPY": {
    "prompt_language": "Which language do you need?",
    "cta_pdf": "Open PDF",
    "cta_page": "Open official resource page",
    "footnote": "From SmartSexResource (BCCDC). Clinical content is updated periodically—use the latest official guidance.",
    "disclaimer": "If a direct PDF is not available for the requested language, we’ll send you to the official SmartSexResource page where you can select your language."
  }
}