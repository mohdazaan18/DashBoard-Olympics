# STORIES.md — Olympic Intelligence Dashboard

The five existing charts answer *who* won and *how many*. These eight stories answer *why*, *when*, and *how strange*. They shift the analytical frame from aggregate leaderboards to structural patterns: does the crowd give host nations an edge, has peak gymnast age drifted younger over decades, which tiny nations punch wildly above their weight, which sports are permanently locked by a single country, and when did women finally achieve equal representation edge-by-edge? Together they expose the social and physiological forces that the medal tables alone cannot show.

---

## Step 1 — Candidate Angle Scoring

| # | Angle | Surprise (0–3) | Implementability (0–3) | Visual Appeal (0–3) | **Total** | Decision |
|---|---|---|---|---|---|---|
| 1 | Gold medalist age by sport across decades | 2 | 3 | 3 | **8** | ✅ Carry |
| 2 | Nations with fewest athletes but highest medal/athlete ratio | 3 | 3 | 2 | **8** | ✅ Carry |
| 3 | Host country medal boost vs athlete share | 3 | 3 | 3 | **9** | ✅ Carry |
| 4 | Sports with extreme height gatekeeping | 2 | 3 | 3 | **8** | ✅ Carry |
| 5 | Which sport achieved gender parity earliest | 3 | 3 | 3 | **9** | ✅ Carry |
| 6 | One-nation monopoly events (>60% of medals) | 3 | 3 | 2 | **8** | ✅ Carry |
| 7 | Medal retention — athletes medaling in 3+ editions | 2 | 2 | 3 | **7** | ✅ Carry |
| 8 | Season comparison — Summer vs Winter medal productivity | 1 | 3 | 2 | **6** | ❌ Drop |
| 9 | Event-level medal concentration per Olympiad | 2 | 2 | 3 | **7** | ✅ Carry |
| 10 | Sport longevity — years a sport has been on the programme | 1 | 3 | 1 | **5** | ❌ Drop |
| 11 | BMI distribution by medal type (gold vs no medal) | 2 | 3 | 2 | **7** | ✅ Carry — reserve |
| 12 | Average team size per edition by sport | 1 | 2 | 1 | **4** | ❌ Drop |

Angles scoring ≥ 7 and with unique chart types selected for the 8 final stories: **1, 2, 3, 4, 5, 6, 7, 9**.

---

## US-01: Host Country Medal Boost

**Priority**: MUST HAVE  
**Chart type**: grouped-bar (two series per Olympiad year)

### Story
As a sports historian,  
I want to compare each host nation's share of gold medals versus their share of total athletes in the same Games,  
So that I can see whether competing at home produces a statistically meaningful advantage or is a media myth.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/medals/host-boost?season=Summer`
- [ ] X-axis: Olympic year (1896 → 2016), filtered by `season`
- [ ] Y-axis: percentage (0–100), two series — `athleteShare%` and `medalShare%`
- [ ] Filters: `season`
- [ ] Aggregation: for each year, count unique `(Name, Year)` athlete appearances for the host NOC and for all NOCs; count medals (Medal ≠ NA) for the host NOC and all NOCs; emit `{ year, hostNOC, athleteShare, medalShare }`
- [ ] Non-obvious insight: Host nations typically win 2–4× more medals relative to their athlete share — the crowd effect is real and measurable, not anecdote

### Backend Note
File: `backend/src/routes/medals.routes.ts`  
Logic: one pass through `filtered`; look up host NOC per year from a static `hostMap` constant; accumulate `hostAthletes`, `totalAthletes`, `hostMedals`, `totalMedals` into a `Record<string, EditionStats>`; divide at the end

---

## US-02: Gold Medalist Age Drift by Sport

**Priority**: MUST HAVE  
**Chart type**: line (multi-series, one line per sport, X = decade)

### Story
As a sports scientist,  
I want to see how the average age of gold medalists in each sport has shifted across decades,  
So that I can understand whether professionalization and sports medicine have made elite performance younger or older.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/athletes/gold-age-by-decade?sport=Gymnastics`
- [ ] X-axis: decade (1890s → 2010s)
- [ ] Y-axis: average age of gold medalists (years)
- [ ] Filters: `sport`, `season`
- [ ] Aggregation: filter `Medal === 'Gold'` and `Age !== 'NA'`; group by `(Sport, decade = floor(Year/10)*10)`; compute `avg(Age)`; return `{ decade, avgAge }[]` for the selected sport
- [ ] Non-obvious insight: Gymnasts' average gold-medal age dropped from ~24 in the 1950s to ~18 by the 1980s — a direct artifact of rule changes that (temporarily) rewarded extreme youth

### Backend Note
File: `backend/src/routes/athletes.routes.ts`  
Logic: single pass through `filtered`; accumulate `{ sum: number, count: number }` per `decade` key; divide at emit; client sends `sport` param to narrow the series

---

## US-03: Nation Efficiency — Medal Rate per Athlete

**Priority**: MUST HAVE  
**Chart type**: treemap

### Story
As a policy analyst at a small national Olympic committee,  
I want to see which nations win the most medals relative to the number of athletes they send,  
So that I can understand whether outsized results come from volume or from elite selection and focus.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/medals/efficiency?season=Summer&minAthletes=20`
- [ ] Each node: NOC, `athleteCount`, `medalCount`, `ratio` (medals ÷ athletes)
- [ ] Node size: `athleteCount` — large = many athletes, small = lean squad
- [ ] Node colour: `ratio` — cold (low efficiency) → hot (high efficiency)
- [ ] Filters: `season`, `year`
- [ ] Aggregation: track unique `(Name, NOC, Year)` for athlete count; count `Medal !== 'NA'` for medal count; filter `athleteCount >= minAthletes`; return sorted by `ratio` desc
- [ ] Non-obvious insight: Several Caribbean and Eastern European nations achieve medal rates 3–5× higher than the USA, whose medal count is inflated purely by squad size

### Backend Note
File: `backend/src/routes/medals.routes.ts`  
Logic: single pass; use a `Set<string>` keyed on `${Name}|${NOC}|${Year}` to deduplicate athletes; accumulate `medals` counter per NOC separately; compute ratio at emit

---

## US-04: One-Nation Monopoly Sports

**Priority**: MUST HAVE  
**Chart type**: bar (horizontal, sorted by monopoly %)

### Story
As an Olympic trivia enthusiast,  
I want to see which sports have been dominated by a single country across all editions,  
So that I can identify sports that function more like national property than global competition.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/sports/monopoly?minMedals=30`
- [ ] X-axis: country medal share % (0–100)
- [ ] Y-axis: sport name
- [ ] Each bar: `{ sport, dominantNOC, dominantMedals, totalMedals, sharePct }`
- [ ] Filters: `season`, `year`
- [ ] Aggregation: one pass — bucket `Medal !== 'NA'` into `sport → NOC → count`; find `max NOC` per sport; filter `totalMedals >= minMedals`; compute share; sort desc
- [ ] Non-obvious insight: The USA has won more than 95% of all rhythmic gymnastics medals in certain eras; Norway dominates Cross-Country Skiing in ways no other nation approaches in any other sport

### Backend Note
File: `backend/src/routes/sports.routes.ts`  
Logic: nested `Record<string, Record<string, number>>` accumulated in one pass; `minMedals` param (default 30) applied at emit

---

## US-05: Gender Parity Timeline by Sport

**Priority**: SHOULD HAVE  
**Chart type**: heatmap (sport × decade, colour = female participant ratio)

### Story
As a gender equity researcher,  
I want to see the female participation ratio for every Olympic sport across every decade,  
So that I can identify which sports led the inclusion movement and which remain stubbornly male-dominated.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/athletes/gender-parity`
- [ ] X-axis: decade (1890s → 2010s)
- [ ] Y-axis: sport name
- [ ] Cell colour: female ratio 0.0 → 1.0 (cold = few women, warm = parity)
- [ ] Filters: `season`
- [ ] Aggregation: one pass — group by `(Sport, decade)`; count `Sex === 'F'` and total; compute `femaleRatio`; emit `{ sport, decade, femaleRatio }[]`
- [ ] Non-obvious insight: Equestrian and sailing reached near-parity in the 1950s while global coverage of women's sport was minimal — athletes competed alongside men by default

### Backend Note
File: `backend/src/routes/athletes.routes.ts`  
Logic: accumulate `{ male: number, female: number }` per `${sport}__${decade}` key in one pass; compute ratio at emit; return flat cell array (same shape as existing `CountrySportHeatmap`)

---

## US-06: Height Gatekeeping by Sport

**Priority**: SHOULD HAVE  
**Chart type**: box-plot (per sport, whiskers = 10th/90th percentile)

### Story
As a youth sports coach,  
I want to see the height distribution of Olympic athletes broken down by sport,  
So that I can understand which sports effectively exclude athletes outside a narrow physique window versus welcoming all body types.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/athletes/height-boxplot?topN=20`
- [ ] X-axis: sport name (sorted by median height desc)
- [ ] Y-axis: height in cm
- [ ] Each box: `{ sport, min, q1, median, q3, max, mean, count }` — same shape as existing `AgeChampionsResponse`
- [ ] Filters: `sport`, `season`
- [ ] Aggregation: one pass to collect `Height` values per sport (skip `NA`); sort arrays for percentile calc at emit
- [ ] Non-obvious insight: Basketball has the smallest inter-quartile range relative to median height of any sport — taller athletes are essentially self-selected out; volleyball is equally gatekept at the high end

### Backend Note
File: `backend/src/routes/athletes.routes.ts`  
Logic: accumulate `Record<string, number[]>` of height values per sport in one pass; sort each array once at emit; compute Q1/Q3 as index-based percentile

---

## US-07: Multi-Edition Medal Retainers

**Priority**: SHOULD HAVE  
**Chart type**: scatter (X = career span in years, Y = total medal editions, colour = sport)

### Story
As an Olympic fan curious about longevity records,  
I want to see which athletes won medals in the most Olympic editions and across the longest careers,  
So that I can understand whether sustained elite performance is more common in certain sports.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/athletes/career?minEditions=3`
- [ ] X-axis: career span (last medal year − first medal year)
- [ ] Y-axis: number of distinct Olympic editions with at least one medal
- [ ] Point label: athlete name, sport
- [ ] Filters: `sport`, `season`
- [ ] Aggregation: one pass; for each athlete name, collect `Set<Year>` of years with `Medal !== 'NA'`; emit athletes with `|set| >= minEditions`; compute `span = max(years) - min(years)`
- [ ] Non-obvious insight: Several shooters and equestrians have medalled across a 20-year span — disciplines where technique outlasts athleticism, making them the only sports where a 50-year-old can legitimately compete for gold

### Backend Note
File: `backend/src/routes/athletes.routes.ts`  
Logic: accumulate `Record<string, { years: Set<string>, sport: string }>` in one pass; filter by `size >= minEditions` at emit; return `{ name, sport, editionCount, firstYear, lastYear, span }[]`

---

## US-08: Event-Level Medal Concentration (Gini Coefficient)

**Priority**: NICE TO HAVE  
**Chart type**: column (X = sport, Y = Gini coefficient of medal distribution across nations)

### Story
As a comparative sports analyst,  
I want to see which sports have the most unequal distribution of medals across nations over all editions,  
So that I can distinguish globally competitive sports from those where structural advantages cement the same nations at the top forever.

### Acceptance Criteria
- [ ] API endpoint: `GET /api/v1/sports/concentration?season=Summer`
- [ ] X-axis: sport name (sorted by Gini desc = most concentrated first)
- [ ] Y-axis: Gini coefficient (0 = perfectly equal, 1 = one nation wins everything)
- [ ] Bars coloured by value: high Gini = deep red, low Gini = teal
- [ ] Filters: `season`
- [ ] Aggregation: one pass — bucket `Medal !== 'NA'` by `(Sport, NOC)`; at emit compute Gini for each sport's NOC medal distribution using the O(n log n) sorted-array formula
- [ ] Non-obvious insight: Team sports like Basketball and Volleyball have far higher Gini coefficients than individual events — the US or Soviet bloc historically swept entire disciplines, not just individual medals

### Backend Note
File: `backend/src/routes/sports.routes.ts`  
Logic: accumulate `Record<string, Record<string, number>>` (sport → noc → count) in one pass; at emit sort each sport's medal array and compute Gini: `G = (2 * Σ(rank_i * x_i)) / (n * Σ(x_i)) − (n+1)/n`; return `{ sport, gini, nationCount, totalMedals }[]`
