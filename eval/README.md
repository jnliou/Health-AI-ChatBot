# Chat Eval Workflow

## 1) Initialize response sheet

```bash
npm run eval:init
```

This creates `eval/responses.latest.json` from template.

## 2) Run prompts in the chatbot UI

For each item in `eval/responses.latest.json`:
- Ask the `prompt` in chat
- Copy assistant reply into `response`
- Add source URLs into `sources` (if shown)

## 3) Score results

```bash
npm run eval:chat
```

The scorer prints:
- total pass/fail counts
- exact failed checks per prompt

## Files

- `eval/prompts.contraception.json`: test cases and quality checks
- `eval/responses.latest.json`: latest run outputs
- `scripts/eval-chat-responses.mjs`: scoring logic

## Notes

- This first version is deterministic and dependency-free.
- Add more prompts over time as you find new failures.
- Keep checks focused (required terms, forbidden artifacts, expected source domain).
