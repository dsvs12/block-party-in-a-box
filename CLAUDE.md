@AGENTS.md

## Claude Code notes

- All project rules live in `AGENTS.md` (imported above) so every agent tool reads the same
  rules. Change them there, not here.
- Before editing, ask which teammate (A, B or C) you're working for if it isn't clear, and
  stay inside that person's files (`tasks/00-shared-contracts.md` §1).
- To check a change in the real page, serve `web/` with `python3 -m http.server -d web 8000`
  and open it in the browser (Playwright or Claude in Chrome), including the browser console.
- Time is short (demos at 2:30 p.m.). Prefer the smallest change that passes the acceptance
  checks in `HANDOFF.md` §9 over refactors.
