# Handoff card: Block Party in a Box

Day in Our Data hackathon, Oak Park IL, Sat 2026-10-03. Work 11:15–2:30, demos at 2:30.
Repo: `dsvs12/block-party-in-a-box` (this repo; public; site on GitHub Pages).
Source data is copied from the event repo `oak-park-cisc/Oak_Park_Day_in_our_Data` (`data/`) into
`source-data/` here, unchanged. Its README and `data/README.md` document every file.
Read this whole card before starting. Every number below was verified against the cached data.
Revised after a product review: Jev was cut; the vendor marketplace is a stretch goal limited to approved block parties (see §2.7 and §7).

## 1. The pitch (lead with the civic question, not the tech)

**Civic question:** Which Oak Park blocks can host a block party, and is that opportunity evenly spread?

**What it adds over the Village's site:** the Village publishes the rules and an online form, but not
an answer for *your* address. This tool gives one: can my street close and why, when is my petition
due, what's on my curb (parking, overnight ban, construction), and if my street can't close, where's
the nearest one that can.

**Users:** resident organizers (main user); Public Works (fewer ineligible applications);
CISC (the open-data recommendation).

**Verified findings (`scripts/probe_reference.py` reproduces them):**
- 887 residential street+hundred segments with address ranges.
- 342 segments are on east/west streets, which the Village doesn't close for block parties.
  Of those, 222 are residential (not main streets). **Say "segments," never "39% of Oak Park."**
- For those 222 residential east/west segments, the nearest eligible segment's midpoint is a median
  **54 m** away (90th percentile 126 m): typically around the corner.
- 441 segments are north/south and not main streets, so likely eligible.
- Shadiest eligible blocks (most trees 24–80 in. diameter): 1100 S Cuyler (55 trees, 18 large),
  1100 S Scoville (56/16), 600 S East (33/15).
- 236/441 eligible blocks have ≥1 surveyed historic building (flyer facts).
- Equity finding: **not computed yet** (§2 step 5). Report whatever it shows, including "no gap."

**Next step for the Village (say this in the demo):** publish approved block events (date, block,
type) and weekend counts against the 30-per-weekend cap as open data, plus an official list of
streets that can close.

## 2. MVP scope (priority order; stop wherever time runs out)

Fully static site hosted on **GitHub Pages** (see §2a). A Python script prebuilds `web/data/blocks.json`; the page is `web/index.html` with
Leaflet from cdnjs. No server, no API keys required. It must still work after today for the showcase.

1. **Data prep → `web/data/blocks.json`** (`scripts/prep_blocks.py`, Python stdlib only). One record per
   street+hundred segment: name, hundred, centroid lat/lon, geometry, `ns`, `arterial`, `eligible`,
   `reason`, `nearest_eligible` (name + hundred + meters, for every ineligible residential segment),
   `tree_count`, `big_tree_count`, `food_nearby` (licensed food businesses within 400 m: name +
   category, read-only), `historic` (address/architect/style/year), `capital_projects`
   (name/type/build_year within ~50 m), `parking` (classification/days/times within ~30 m),
   `overnight_ban` (bool), `svi` (block group `Composite_Index`, `Language_Index`).
   Start from `scripts/probe_reference.py`.
2. **Address lookup:** "1100 S Cuyler Ave" → segment, using street address ranges (§4).
3. **Map:** segments colored eligible / east-west / main street; click one to open its packet.
4. **Block packet panel:** eligibility + reason; nearest eligible block if not; Village rules
   checklist; petition deadline (event date − 14 days, computed in code; out-of-season warning);
   curb summary in plain text generated from fields (parking, overnight ban, construction);
   shade; licensed food nearby; history facts; button linking to the Village's official form.
5. **Equity lens:** join centroids to `source-data/social-vulnerability-oak-park.geojson` (53 areas)
   with stdlib point-in-polygon. Print eligible share and average big-tree count by
   `Composite_Index` quintile; add a map toggle. Write one honest sentence about the result.
6. **Printable flyer:** a code template filled from the segment's record (date, time, block, shade,
   one history fact). Optional if time remains: a Claude rewrite or translation, labeled
   "AI-written / machine-translated, not reviewed." Never put an API key in the static page.

7. **Stretch: vendor marketplace for approved block parties only.** Only after steps 1–6 pass.
   - An organizer can list a party on the marketplace **only if it is an approved block party**:
     an eligible segment, a date inside the season, and the organizer confirms the Village approved
     it (tick box + approval date; there is no public list to check against, so say so on screen).
     Unapproved, ineligible or out-of-season parties never appear.
   - The organizer posts what they'd like (e.g. "ice cream, 2–4 p.m."). Vendors reply with an
     **interest note**: what they'd bring, time window, and whether they hold a Temporary Food
     Vendor permit. **No money offers, no payments.**
   - Rule checks in code: no alcohol; vendor must confirm the food vendor permit; party must still
     be in the future and approved. Matching/ranking is a transparent weighted score shown on screen.
   - Static site, so it's a demo flow: sample parties and replies in `web/data/marketplace-sample.json`
     (plus the browser's localStorage for new entries). Shared, multi-user storage is a post-event step.
   - **Vendors in the sample are fictional** ("Sample Ice Cream Co."). Never use real business names.
   - Banner: "Concept only. Whether vendors may sell at block parties must be confirmed with
     Public Works before anything like this goes live."

### 2a. GitHub Pages deployment

Already set up: this repo has `.github/workflows/pages.yml`, which publishes `web/` on every push
to `main`, and Pages is enabled with Source = GitHub Actions. `web/index.html` is a placeholder.
- Everything the page loads must live under `web/`: `index.html`, `web/data/blocks.json`,
  `web/data/block-party-rules.json`, any CSS/JS. The site can't reach `../data/` in the event repo.
- Use relative paths only (`data/blocks.json`, never `/data/...`): a Pages project site is served
  under `/<repo-name>/`.
- Load Leaflet and map tiles from public CDNs (e.g. cdnjs + OpenStreetMap tiles with attribution).
- Commit the prebuilt `blocks.json` so the workflow doesn't need to run Python. Check the
  Actions tab after each push.
- Keep `blocks.json` small enough to load quickly on a phone: round coordinates to 5 decimals and
  drop fields the page doesn't use. Check its size.
- Test locally first with `python3 -m http.server -d web 8000` (opening the file directly can
  block `fetch` of the JSON).
- Deploy a first rough version by 12:45 so hosting problems show up early, then redeploy as you go.
- Everything published is public: only public data, no keys, nothing personal.

**Out of scope:** money bids or payments, Jev, payments, real permit submission, contacting
anyone, neighbor lists, live weather, accounts.

## 3. Hand-made data (~30 min, by the non-coder)

- `web/data/block-party-rules.json`, copied by hand from
  https://www.oak-park.us/Community/Events-and-Activities/Block-Parties-and-Sales (the site blocks
  scripts): season Apr 4–Oct 31 2026; hours 9 a.m.–11 p.m.; east/west streets may not be closed;
  petition signed by ≥10 separate addresses (or a majority on small blocks); petition due ≥2 weeks
  before; max 2 events per block per year; max 30 block events per weekend village-wide, first come
  first served; no alcohol sales; keep items in the curb parking lane; nothing strung across the
  street; Village drops barricades the day before (Friday for weekend events) and picks them up
  after; Green Block Party kit (compost/recycling/trash bags + 3 event boxes, goal <10% landfill);
  online form webforms.oak-park.us/Forms/blockevent; Public Works publicworks@oak-park.us,
  708.358.5700. Block sale petition needs 75% of residences on both sides.
  **These are the 2026 rules. Show "Rules shown are 2026; confirm 2027 with Public Works."**
  Optional: read the 2026 Guidelines PDF on that page for fees/insurance not on the web page.
- `docs/open-data-proposal.md`: proposed schema for the Village to publish
  (approved block events: date, street, hundred block, type; weekend counts vs. the 30 cap;
  closable-streets list) and why it helps residents and Public Works.

## 4. Data files and gotchas (all in `source-data/`)

| File | Use | Gotchas |
|---|---|---|
| `source-data/streets-oak-park.geojson` (3,343 LineStrings) | Segments + address lookup | Props `street_name, address_left_from/to, address_right_from/to, length_ft`. Skip `street_name=='ALLEY'` and address `-1` (ramps/I-290). Names are uppercase, sometimes with a direction prefix (`S CUYLER AVE`), sometimes not (`HOME AVE`). Direction: north/south if \|Δlat·110540\| > \|Δlon·111320·cos(41.885°)\| between first/last coords. Curved streets can misclassify; spot-check on a real map. |
| `source-data/trees-oak-park.csv` (18,837) | Shade | `block` is a full string like `"1200 N AUSTIN BLVD"`: key = (`nearest_street`, int(first token)//100*100). Matches 94% of eligible segments. Treat `dbh_in` ≥ 80 as data errors (max is 111). |
| `source-data/business-licenses-oak-park.csv` | Food nearby (read-only) | `license_status=='Active'` (1,426). Food = `general_category` in {Restaurant, Food Sales} (161 with lat/lon). 193 active rows lack lat/lon. No contact fields. |
| `source-data/historic-buildings-oak-park.csv` (4,958) | Flyer facts | `address` like `532 FAIR OAKS AVE`; `architect, style_primary, construction_year, historical_summary` (2,114 filled), `image_url`. 1,568 have blank style. |
| `source-data/capital-projects-oak-park.geojson` (244) | Construction warning | `build_year` 2025–2029 or None (158). |
| `source-data/parking-restrictions-oak-park.geojson` (1,532 MultiPolygons) | Curb rules | `classification` (PARKING/NOPARKING), `days_of_enforcement`, `enforcement_times`, `duration_restriction`, `permit_zone`, `is_tow_away`. `event_restriction` is empty everywhere. |
| `source-data/parking-overnight-ban-oak-park.geojson` (431) | Overnight ban (2:30–6 a.m.) | `ban_type`, `parking_area_name`. |
| `source-data/social-vulnerability-oak-park.geojson` (53 Polygons) | Equity lens | `Composite_Index`, `Language_Index`, plus other `*_Index` fields; `GEOID`. |

Main-street list (our assumption, not a published rule; say so): Harlem, Austin Blvd, Oak Park Ave,
Ridgeland, Madison, Roosevelt, North Ave, Chicago Ave, Lake St, Washington Blvd, Garfield,
Jackson Blvd, Division, Harrison, I-290 and ramps.
Distances: project lon/lat to meters with kx = 111320·cos(41.885°), ky = 110540. shapely/geopandas
are not installed; stdlib geometry is fine at this scale.

**Rule: every count, distance, date and eligibility result is computed in code.** No model decides
or invents facts.

## 5. Acceptance checks (done = these pass)

- [ ] `python3 scripts/prep_blocks.py` runs with stdlib only, writes `web/data/blocks.json`, and prints
      887 segments / 342 east-west / 441 eligible / median nearest-eligible ≈54 m (or explains any change).
- [ ] `1100 S Cuyler Ave` → eligible, 55 trees, packet complete.
- [ ] An east/west residential address → "Not eligible: east/west street" + nearest eligible block
      with distance.
- [ ] Deadline: event date 2026-10-17 → petition due 2026-10-03; a date after Oct 31 → "outside
      season"; the demo uses a 2027 date (e.g. 2027-06-12 → due 2027-05-29).
- [ ] Equity: script prints eligible share by `Composite_Index` quintile; map toggle works.
- [ ] Site is live on GitHub Pages (§2a) and the address lookup, map and packet work there,
      with no server and no keys; the Pages link is in README.
- [ ] Footer: "Prototype, not an official Village of Oak Park product. Rules shown are 2026."
- [ ] (Stretch) Marketplace lists only approved, eligible, in-season parties: an east/west segment,
      an unapproved party, or a past/out-of-season date never appears; a vendor note offering
      alcohol or without the food vendor permit is flagged; all sample vendors are fictional.
- [ ] Any AI-written or translated text is labeled as such; `git grep -n "sk-"` returns nothing.

## 6. Limitations to state in the demo

Counts are street segments, not residents. The main-street list is our assumption. Orientation is
computed from geometry and may misclassify curved streets. The 30-per-weekend availability and
past approved events aren't public, so we can't show which blocks actually hold parties. Rules are
2026 and may change for 2027. 193 active licenses have no location. Tree diameters have outliers.

## 7. Decisions already made (don't reopen)

- **Marketplace only for approved block parties, as a stretch goal, with no money involved.**
  Vending at block parties isn't established as allowed (no alcohol sales; vendors need a
  VillageView permit + Temporary Food Vendor Application + health rules), and selling access to a
  closed public street would alarm Village staff. Keep it to interest notes, fictional sample
  vendors, and the "confirm with Public Works" banner.
- **Never attach real business names to invented data.**
- **No Jev.** An alpha, untested black box adds risk and no value for civic judges; rules are code checks.
- **Static site on GitHub Pages** so the showcase link outlives the event.
- **Frame for the 2027 season** (today is effectively the last 2026 filing day).

## 8. Team roles and timeline

| Time | Coder A | Coder B | No-code |
|---|---|---|---|
| 11:15–12:00 | prep_blocks.py core fields + address lookup | `nearest_eligible` + SVI join | Rules JSON; check 10 segments' direction on a real map |
| 12:00–12:45 | Remaining packet fields; first rough Pages deploy | Equity quintile table + one-sentence finding | Open-data proposal |
| 1:00–2:00 | Map + packet panel | Equity map toggle + flyer template | Demo script, screenshots |
| 2:00–2:30 | Acceptance checks, final Pages deploy | Same | README via the `hackathon-readme` skill |

**Hero demo (90 s):** type 1100 S Cuyler → green/eligible → packet for a 2027-06-12 party (petition
due 2027-05-29, curb rules, no construction, 55 trees) → printable flyer → official-form button.
Type an east/west address → "Not eligible; nearest eligible block is N m away." Close on the
equity map and the open-data ask.

Demo owner: decide at 11:15.
