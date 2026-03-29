# SIA: Sexual Information Assistant

SIA is a Vite + React prototype for private sexual health education, STI triage support, clinic discovery, and provider handoff workflows for British Columbia users.

The app combines:

- Guided sexual health chat
- STI and contraception knowledge retrieval
- Multilingual resource support
- Clinic lookup and triage routing
- Patient summary generation
- Provider-facing intake note preview and EMR handoff prototype

## What the app does

The current app flow is:

1. Start on the landing page and enter the chat experience.
2. Ask sexual health, STI testing, pregnancy, or contraception questions.
3. Get responses grounded in curated SmartSexResource and HealthLinkBC content, with optional Ollama-backed generation during local development.
4. Build a structured triage summary from the conversation.
5. Find clinics and prepare a provider handoff.
6. Generate a 6-character access code and open a provider view that formats the summary into an EMR-style intake note.

## Current implementation notes

This repository is a prototype. A few important details:

- The provider handoff and shared summary registry are currently stored in browser `localStorage` and `sessionStorage`.
- The app presents privacy and encryption-oriented UX copy, but the current codebase does not implement real end-to-end encrypted server persistence.
- Clinic data is currently mocked in-app.
- The map tab is a prototype placeholder rather than a live map integration.
- The local LLM path expects Ollama to be running during development.

## Tech stack

- React 18
- TypeScript
- Vite 6
- React Router 7
- Tailwind CSS 4
- Radix UI components
- MUI icons
- Ollama proxy integration for local chat generation

## Key features

- Chat-based STI, contraception, pregnancy, and safer-sex guidance
- Rule-based and retrieval-augmented response handling
- Curated sources from SmartSexResource and HealthLinkBC
- Multilingual resource catalog with resource health checking
- Symptom and exposure triage support
- Patient summary form and summary viewer
- Clinic list with geolocation-based distance sorting
- Provider view with editable intake note and clipboard export
- Lightweight evaluation workflow for regression checking chat quality

## Project structure

```text
app/
  components/         Reusable UI and domain components
  data/               STI, FAQ, contraception, multilingual, and mock data
  hooks/              Resource health-check hooks
  pages/              Routed pages for landing, chat, clinics, handoff, share, provider view
  types/              Shared TypeScript types
  utils/              RAG, date, summary, and shared registry utilities
src/
  main.tsx            Frontend entry point
styles/               Global CSS, theme, fonts, Tailwind imports
scripts/              Eval and regression scripts
eval/                 Prompt sets, response templates, and eval docs
```

## Routes

- `/` landing page
- `/chat` main assistant chat
- `/education` education content
- `/triage` triage workflow
- `/clinics` clinic list
- `/clinics/:id` clinic detail
- `/handoff` patient consent and handoff flow
- `/share` access code generation
- `/provider` provider code entry view
- `/view/:code` provider summary view
- `/privacy` privacy and security page

## Local development

### Prerequisites

- Node.js 18+ recommended
- npm
- Ollama running locally at `http://127.0.0.1:11434` if you want LLM-backed responses

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

The Vite dev server proxies:

- `/ollama` -> local Ollama server
- `/healthlinkbc` -> `https://www.healthlinkbc.ca`
- `/smartsexresource` -> `https://smartsexresource.com`

### Build for production

```bash
npm run build
```

### Preview the build

```bash
npm run preview
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run eval:init
npm run eval:chat
npm run test:chat-logic
```

What they do:

- `eval:init`: creates `eval/responses.latest.json` from the template
- `eval:chat`: scores captured chat responses against prompt checks
- `test:chat-logic`: runs deterministic regression checks for chat logic

More detail is in `eval/README.md`.

## Knowledge sources

The app is designed around trusted BC-focused health resources, primarily:

- BCCDC SmartSexResource
- HealthLinkBC
- GetCheckedOnline

The retrieval utilities in `app/utils/ragRetrieval.ts` prioritize curated source pages for STI and contraception questions.

## Prototype limitations

- No backend persistence layer
- No real authentication or secure provider portal
- No true encrypted data exchange despite privacy-first product copy
- Shared summaries are only available on the same browser context/device unless a real backend is added
- Clinic directory is mock data, not a live synchronized feed

## Suggested next steps

If you want to evolve this beyond prototype stage, the highest-value next steps are:

- Move shared summary storage to a real backend
- Replace privacy placeholder claims with implemented controls or revise product copy
- Add real clinic directory ingestion
- Add automated frontend and integration tests
- Define deployment, environment configuration, and observability

## Disclaimer

This application is a sexual health information and triage prototype. It is not a substitute for professional medical advice, diagnosis, or treatment. For emergencies, users should contact local emergency services or seek urgent care.
