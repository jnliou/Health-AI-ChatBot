Create a mobile-first prototype for **SIA: Sexual Information Assistant** — a privacy-first, multilingual sexual health chatbot for British Columbia.

SIA must use these official data sources:
• Education + guideline content from BCCDC SmartSexResource: https://smartsexresource.com
• Clinic locations + services from: https://smartsexresource.com/clinics-testing/
• Online testing referrals link to GetCheckedOnline (part of BCCDC ecosystem).

Core flows to design:

1) **Guest Mode (Anonymous)**
- Landing screen: “Private, multilingual sexual health support — no account required.”
- Language selector (20+ languages).
- Privacy explainer: client-side encryption, zero-knowledge, 14‑day auto-deletion, user-owned 6‑character Access Code.

2) **Chat Interface**
- Clean chat UI with assistant + user bubbles.
- Assistant messages show a small “[Source]” pill linking back to SmartSexResource pages.
- Include quick chips: Symptoms, Testing, Clinics Near Me, Contraception, Safer Sex.

3) **Education Flow**
- User taps “Learn” → open cards generated from SmartSexResource content (e.g., STIs, contraception, testing info).
- Each card shows a title, brief summary, and “View Source” linking back to SmartSexResource.

4) **Asymptomatic Triage → Digital Testing**
- Triage questions to assess symptoms.
- If no symptoms → show “You may be eligible for online testing.”
- CTA: “Continue to GetCheckedOnline” (opens external link).

5) **Symptomatic Triage → Clinic Routing**
- Ask for location permission.
- Fetch clinics from the SmartSexResource clinic directory: https://smartsexresource.com/clinics-testing/
- Show map view + list view (distance, hours, services, accessibility).
- Include filter chips (Walk-in, Appointment, Youth-friendly, LGBTQ2S+ friendly, Languages).

6) **Clinic Detail Screen**
- Show clinic name, address, hours, available services, link to source page.
- CTA: “Select this clinic.”

7) **Smart Handoff (Optional)**
- Screen: “Switch to Patient” → consent modal explaining what will be shared.
- Generate a structured **FHIR-style Patient Summary**: symptoms, onset, risk factors, sexual history, medications, allergies, pregnancy considerations.
- Preview + CTA “Share Summary with Clinic.”

8) **Sharing UX**
- Show QR code + 6-character Access Code (user-held key).
- Small text: “Clinics can unlock your encrypted triage info with this code. Data deletes after 14 days.”

9) **Security & Safety**
- Simple 3-step cards: client-side encryption → user-held Access Code → time-limited storage.
- Out-of-scope questions trigger: “This goes beyond verified guidelines. Please speak to a clinician.” + nearby clinic suggestions.

Visual + UX guidelines:
- Use BC-blue + teal for primary branding.
- Rounded cards, friendly typography, inclusive/stigma-free feel.
- Light & dark mode variants.
- Clear iconography for Sources, Location, Privacy, and Encryption.

Make all flows fully clickable: Guest Mode → Chat → Asymptomatic or Symptomatic → Clinic Routing → Optional Patient Summary → Share.