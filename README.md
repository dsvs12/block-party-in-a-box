# Party in a Box: Oak Park block party planning

A Day in Our Data hackathon project (Oak Park, IL, October 3, 2026).

**Civic question:** How can Oak Park make block parties easier to plan and approve, while keeping
busy streets open?

- **Live site:** https://dsvs12.github.io/block-party-in-a-box/
- **Status:** being built today. The build plan is in [HANDOFF.md](HANDOFF.md); team task files
  are in [tasks/](tasks/).

## What it does

Today the Village publishes rules, PDF petitions and a web form, but nothing connects the
resident, the vendors they hire and the Village reviewer. Party in a Box puts all three in one flow:

- **Resident:** type an address → see whether the block can host a party (and the nearest
  block that can, if not), the petition deadline, curb parking and shade; request a date range;
  share a petition link with neighbors (mock, sample signers only).
- **Vendor:** see upcoming parties that want a vendor and send a price quote (fictional sample vendors).
- **Village reviewer:** see each request with a traffic impact score and its reasons, the
  weekend count against the 30-event cap, signatures against the 10-address minimum, and all
  quotes; approve a date, reject, or comment.

## What we found in the data

Computed from the source data (887 / 342 / 441 and the shade list are reproduced by
[`scripts/probe_reference.py`](scripts/probe_reference.py)):

- Oak Park has **887** street + hundred-block segments with address ranges.
- **342** segments are on east/west streets, which the Village doesn't close for block parties;
  222 of those are residential.
- For those 222, the nearest eligible segment is a median **54 m** away (90th percentile 126 m).
- **441** segments are north/south and not main streets, so likely eligible.
- Shadiest eligible blocks, by large trees: 1100 S Cuyler (55 trees, 18 large), 1100 S Scoville
  (56 trees, 16 large), 600 S East (33 trees, 15 large).

## What's real and what's sample data

The site is static: no server, no database, no logins.

- **Real:** block eligibility, nearest eligible block, rule checks, petition deadline, trees and
  curb parking are computed in code from public data. The traffic impact score uses public data
  plus nearby *sample* requests.
- **Sample:** requests, petition signers, vendors and quotes are **fictional**, and anything
  you add is saved only in your own browser.
- **Traffic impact** is a rule-based score from bus stops, nearby schools, capital projects
  and nearby requests. It is not measured traffic.
- **The 30-per-weekend count** includes only our sample requests; the real count isn't public.
- **Main streets** that can't be closed are our own list (an assumption, see `HANDOFF.md` §4).

## Data sources

All in [`source-data/`](source-data/), copied unchanged from the event repo
[oak-park-cisc/Oak_Park_Day_in_our_Data](https://github.com/oak-park-cisc/Oak_Park_Day_in_our_Data)
(MIT License, see `source-data/LICENSE-event-repo`). Block party rules come from the Village's 2026
[Block Parties and Sales page](https://www.oak-park.us/Community/Events-and-Activities/Block-Parties-and-Sales).

Used: streets, trees, transit stops, schools, capital projects, parking restrictions, overnight
parking ban. Included for optional features: business licenses, historic buildings, social
vulnerability.

## Next steps for the Village

- Pilot this flow with Public Works.
- Publish approved block events and weekend counts against the 30 cap as open data.
- Tell us whether VillageView (the Village's online permit system) has an API.

## Run the demo locally

Needs Docker, [uv](https://docs.astral.sh/uv/) and Node 20+. The UI talks to the FastAPI backend in
[`api/`](api/README.md), which runs on Postgres with fictional sample data.

```sh
# 1. API + database (first terminal)
cd api
docker compose up -d                      # Postgres 16 on localhost:5433
cp -n .env.example .env                   # optional: paste ANTHROPIC_API_KEY for live AI summaries
uv sync && uv run alembic upgrade head
uv run python -m app.seed                 # sample requests, vendors, petitions (re-run to reset)
uv run uvicorn app.main:app --port 8000   # API docs at http://localhost:8000/docs

# 2. UI (second terminal, repo root)
npm install
npm run dev                               # open http://localhost:5173
```

Sign-in is mocked: the UI sends a dev token per role (`dev-resident-a`, `dev-vendor-icecream`,
`dev-reviewer`); change them in `.env.development` to view as another sample user. Without an
Anthropic key the Traffic planner shows a labelled templated summary instead of an AI-written one.

Tests: `cd api && uv run pytest -q`. Every push to `main` deploys `web/` to GitHub Pages, but the
hosted page needs a hosted API (`VITE_API_BASE`) to show data.

---

Prototype, not an official Village of Oak Park product. Rules shown are 2026; confirm 2027 with
Public Works.
