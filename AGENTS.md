# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repo.
Humans: start with [README.md](README.md).

## What this is

**Party in a Box**: a static web app for planning and approving Oak Park, IL block parties.
Built at the Day in Our Data hackathon, 2026-10-03. Three views on one page: Resident, Vendor,
Village reviewer. Static GitHub Pages site: no server, no database, no logins. Multi-user
features run on **fictional sample data** saved in the browser's localStorage.

## Read before changing anything

1. [`HANDOFF.md`](HANDOFF.md): product, rules, traffic score, data gotchas, acceptance checks.
2. [`tasks/00-shared-contracts.md`](tasks/00-shared-contracts.md): file ownership, page
   architecture, JSON shapes, `Store` and `Logic` APIs. **These are interfaces between three
   people working in parallel. Don't change a shape or a function signature without being asked.**
3. The task file for the person you're working for: `tasks/A-*.md`, `tasks/B-*.md` or `tasks/C-*.md`.

## Layout

```
scripts/probe_reference.py   verified reference numbers (887 / 342 / 441); don't change its logic
scripts/prep_blocks.py       stdlib-only build script → web/data/blocks.json
source-data/                 event data, copied unchanged; never edit
web/                         everything GitHub Pages serves
  index.html                 the single page
  css/  js/                  one JS file per view + logic.js, store.js, app.js
  data/                      blocks.json (generated, committed), block-party-rules.json, sample.json
tasks/                       per-person task files and shared contracts
.github/workflows/pages.yml  deploys web/ to GitHub Pages on every push to main
```

Planned files that may not exist yet: `scripts/prep_blocks.py`, `web/css/`, `web/js/`,
`web/data/*.json`. Build them to the shapes in the contracts file.

## Commands

```sh
python3 scripts/prep_blocks.py          # must print 887 segments / 342 east-west / 441 eligible
python3 -m http.server -d web 8000      # local test at http://localhost:8000
python3 -m json.tool web/data/sample.json > /dev/null   # validate a JSON file
git grep -n "sk-"                       # must print nothing
```

There is no build step and no test suite. Verify in a browser and against `HANDOFF.md` §9.

## Hard rules

- **File ownership.** Edit only files owned by the person you're working for (table in the
  contracts file). Need a change elsewhere? Say so; don't make it. `AGENTS.md`, `CLAUDE.md`,
  `HANDOFF.md` and the contracts file change only after telling the team.
- **Freeze at 2:15 p.m.** After that, bug fixes only, and only after telling the team.
- **Never push a broken page.** Every push to `main` deploys to the live site. Test locally
  first, then `git pull --rebase` before `git push`.
- **No build tooling.** Plain `<script src>` tags, one global per module, no ES modules, no npm.
  External libraries from cdnjs only (Leaflet, jsPDF). Relative paths only (`data/blocks.json`).
- **Python is stdlib only.** No shapely, pandas or geopandas.
- **Coordinates:** GeoJSON is `[lon, lat]`; `blocks.json` stores `[lat, lon]` for Leaflet.
  Distances use `KX = 111320·cos(41.885°)`, `KY = 110540` meters per degree.
- **Dates:** parse `"YYYY-MM-DD"` as local dates (`new Date(y, m-1, d)`), never `new Date(str)`.
- **localStorage:** wrap every read/write in try/catch; the page must work without it.
- **No secrets, no AI decisions.** No API keys anywhere. Every count, distance, date check and
  score is computed in plain code.

## Privacy and honesty (non-negotiable)

- Never collect real personal information. Every form shows at least "Demo only — do not enter real
  personal information."
- Sample people and vendors are fictional. **No real business names** in sample data or bids.
- A "bid" is a vendor's price quote to the organizer for its own service.
- Traffic impact is a rule-based score with listed reasons. Never call it delay or minutes.
- Say "segments", never "39% of Oak Park".
- The main-street list is our assumption (`HANDOFF.md` §4); label it as one in the UI.
- Footer on every view: "Prototype, not an official Village of Oak Park product. Rules shown
  are 2026; confirm 2027 with Public Works. Demo runs on sample data saved in your browser."
- Draft PDFs and typed "signatures" are marked as drafts, never as official Village documents.

## Commits

Small, focused commits on `main`. Imperative subject line. Don't commit files you didn't change.
