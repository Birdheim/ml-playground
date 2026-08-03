# ML Playground — Ideas & Decisions

Working notes for where this project is going and why. Written 2026-08-03.

## The point of this project

I built this because I tried to explain what I was studying to my family and
they understood nothing. The site is a way to *show* them, and a way for me to
experiment with web development.

Everything below should be judged against that: **would this help someone with
no ML background understand what is happening?** If it only makes sense to
someone who already knows ML, it is the wrong feature.

Two working principles:

- **Don't overcomplicate.** Small, readable code beats clever code.
- **Easy to extend.** Adding a new model or dataset should touch as few places
  as possible.

## Working on this repo

**Decision: merges into `main` never fast-forward.** Work happens on a branch
and comes back through a merge commit, so each piece of work stays a single
identifiable thing in the history rather than dissolving into a line of
unrelated commits.

This is enforced by git rather than by remembering:

```
git config branch.main.mergeOptions "--no-ff"
```

It is scoped to `main` only — merges into other branches still fast-forward
normally. Note this is local config, so it lives in `.git/config` and does not
travel with a clone.

The point is being able to wind back. With a merge commit, undoing a whole
feature is one command regardless of how many commits it contained:

```
git revert -m 1 <merge-sha>
```

Without it, a branch that had five commits leaves five commits on `main` with
nothing marking where the feature started or ended.

Everything merged before this decision (up to `41dcaa0`) went in as a
fast-forward. That history happens to still be easy to unpick because each
feature landed as exactly one commit — but that was luck, not design.

## Eve

Eve is the mascot and the guide. She is not decoration — she is how the site
explains itself.

Three poses exist as assets, all `330x361` so they swap in place:

| Asset | Mood | Used when |
|---|---|---|
| `eve.svg` | neutral | explaining, idle, prompting |
| `eve_cheer.svg` | happy | good result, model did well |
| `eve_hiding.svg` | hiding | bad result, or "I'm still learning that" |

**Decision: Eve's dialogue is hand-written, not LLM-generated.** Her lines are
a small known set that need to be warm, correct and on-message. Generating them
would make her slower, occasionally wrong about the ML, and off-character — and
would mean the core loop needs an API key to work at all.

**Decision: Eve reacts to results, not to slide numbers.** Rather than a
skippable intro carousel, she lives inside the Playground and responds to what
the user actually did. A locked experiment gets a hiding Eve; 103 of 143 gets a
comparison against what you guessed. Her emotional states are earned by real
outcomes, which is what makes them mean anything.

**Decision: Eve is a sticky side rail, not a page header.** As a header she and
her speech bubble scrolled away exactly when the user reached the thing she was
explaining. She now stays on screen the whole way down, and drops to a normal
block under 860px where there is no room for a rail.

## Routing

Settled naming, replacing the mix of `Tutorial` / `Resources` / `Playground`:

| Route | Nav label | Contents |
|---|---|---|
| `/` | — | Landing page (hero, what this is) |
| `/playground` | Playground | The gallery of questions |
| `/playground/:experiment` | — | One question, walked through in stages |
| `/learn` | Learn | Concept explanations, Eve's longer-form teaching |
| `/about` | About | Me, the project, the GitHub link |

- "Tutorial" became "Playground" — *playground* is the noun in the project name
  and it's what people came for. "Tutorial" sounds like homework.
- "Resources" merged into "Learn" — for the target audience they are the same
  thing (stuff to read), and splitting them forces a choice between two doors
  with no way to know what's behind either.
- All routes lowercase. They used to be capitalised in `App.tsx` while the
  navbar linked lowercase; React Router matched case-insensitively so it worked
  by accident.

## The core insight: accuracy is the wrong output

The backend used to return `{"accuracy": 0.9666}` and nothing else. A decimal
between 0 and 1 teaches a beginner nothing — it presumes you already know what
a train/test split is and why 0.97 is good but 1.0 is suspicious.

So the result panel reports:

- **Counts, not decimals** — "29 of the 30 test flowers correct".
- **The actual mistakes** — the specific rows the model got wrong. One concrete
  error teaches more than any metric, and it makes the model feel fallible and
  inspectable rather than magic.

## The second insight: a control panel is not a lesson

The first version of the playground put a dataset picker, four model cards and
two sliders on one screen. That is a **control panel**, and control panels are
for people who already know what the knobs do. It asked a visitor to choose
between a Support Vector Machine and a Decision Tree before giving them any
basis for choosing — and before giving them any reason to care about the
answer. Three decisions were required before anything happened.

Two decisions came out of that.

**Lead with a question, not a dataset.** `/playground` is a gallery of
questions in plain language: *Who survived the Titanic?*, *How much is this
house worth?*. Not "Classification" and "Regression" — those name the
technique, and the technique is the part the audience does not have yet.

**Put the payoff before the controls.** Inside an experiment the stages are:

1. **intro** — Eve asks the question and shows five real rows
2. **guess** — "out of 143 passengers it has never seen, how many will it get
   right?" A slider, and the first call to action, about *them* rather than
   about ML
3. **result** — the score lands against their guess, Eve reacts
4. **tinker** — *only now* do the model picker and settings appear

Settings coming after the first result is the whole point. A newcomer gets a
win before making a single decision, and each stage shows one thing instead of
three panels competing at once.

## Experiment catalogue — where new capabilities go

`backend/services/experiment_catalog.py`, mirroring the model catalogue. Each
entry is a question wrapped around a dataset, with its teaser, the name for one
row ("passenger" beats "sample"), names for the answers, and optional display
labels so a preview table can show "female" and "3rd" instead of 1 and 3.

**Decision: unbuilt experiments stay visible in the gallery, locked.** Seeing
*How much is this house worth?* greyed out with Eve explaining she has not
learned regression yet is more encouraging than a gallery that looks finished.
It also answers "where does Neural Nets go" — it goes here, as a question, with
`available: False` until it works.

## Model catalogue — the extensibility decision

**Decision: one config object is the single source of truth for models.**

`backend/services/model_catalog.py` holds each model's label, plain-English
blurb, estimator class, and parameter definitions (type, default, range,
human-readable label, help text). It is served at `GET /models`, and the
frontend *renders the hyperparameter form from it*.

Adding a model is one dict entry. The UI updates for free — including the
explanations, which is the part the audience needs most.

The tradeoff, stated honestly: this replaced the per-model Pydantic
discriminated union in `train_schema.py`, so validation is now at runtime
against the catalogue instead of static per-model types. For a project whose
goal is easy extension, one place to edit beats four.

## Charts and visuals

**Decision: the model cards are diagrams, not paragraphs.** Four dense text
blocks competing for attention looked nothing like the rest of the site and
explained nothing at a glance. Each model now has a small inline SVG —
KNN as a dot ringed by its nearest neighbours, a decision tree as a branching
tree, logistic regression as dots split by a line, SVM as the same line with
its margin drawn. The drawing carries the explanation, so the card only needs
the model's name. They use `currentColor`, so they follow the theme and the
selected state without extra rules.

**Decision: no charting library for now.**

The interactive ML canvases — clicking to place your own data points, painting
a decision boundary — are not what charting libraries are for. Those libraries
render data you hand them; here the *user is authoring the data*. An SVG
scatter plot with a linear scale is about 50 lines, and the pixel↔data maths is
four of them:

```
x_pixel = (x_data - x_min) / (x_max - x_min) * width
x_data  = (x_pixel / width) * (x_max - x_min) + x_min
```

Rolling it means full control and it inherits the CSS variables for free.

If a library becomes worth it later, use **visx** (`@visx/scale`, `@visx/axis`)
— it's unstyled by design and composes with existing CSS. Not Recharts (too
opinionated for click-to-author interactions), not Plotly (~3MB and brings its
own visual identity that would fight the design).

**Rendering the decision boundary:** don't emit thousands of SVG rects. Have
the backend return a coarse grid (e.g. 60×60 of predicted class ids), draw it
to a small `<canvas>` with `putImageData`, and scale it up with CSS.

## Where an LLM fits

**Rule: use an LLM where the input is unbounded and the output is checkable by
the user. Avoid it where we already know what to say.**

Good uses:

- **Explaining an uploaded CSV.** The strongest one. When someone uploads their
  own data the site cannot know what `f3` or `bmi` means, because the input is
  unbounded. Given column names and a few sample rows, a model can say "this
  looks like medical data; you're predicting diabetes onset". No hand-written
  content covers this.
- **Turning a wish into an experiment.** A text box where you type "what
  happens if the computer just memorises everything?" and Eve sets the model
  accordingly. Works because the output is constrained to a tiny structured
  space (model name + a few numbers) and *the user sees the sliders move* — a
  bad guess is visible and fixable.
- **Narrating the mistakes.** We compute which rows were misclassified; the LLM
  only translates that into English. Numbers stay ours, phrasing is generated.
  Keep that boundary strict and it cannot invent a result.

Bad use: generating Eve's core dialogue (see above).

**Security: the API key lives in the FastAPI backend, never the frontend.**
Vite inlines any `VITE_*` env var directly into the JavaScript bundle shipped
to the browser, so a key put there is publicly readable and gets scraped. Add
an endpoint that holds the key server-side; the frontend calls that endpoint,
the same way it calls `/train`.

Free tiers worth trying: Google Gemini (easiest start), Groq (fast). Put the
call behind one function in `services/` so swapping providers is a one-file
change.

## The Titanic dataset

Iris, wine and breast cancer are ML canon and all abstract — nobody has
intuitions about sepal width. Titanic is instantly graspable, and people can
argue with the predictions, which is exactly the engagement this project wants.

It is **not bundled with scikit-learn** (only iris, wine, breast cancer,
digits, diabetes and linnerud ship offline), so it was downloaded from the
seaborn-data mirror and preprocessed into `backend/datasets/titanic.csv`.

Two things matter about that preprocessing, both in the script comments:

- The raw file has an `alive` column that is the target spelled as yes/no.
  Leaving it in gives a fake 100% and teaches nothing. It was verified to be an
  exact copy of `survived`, then dropped, along with `class`, `who`,
  `adult_male`, `embark_town` and `alone`, which restate other columns.
- 177 rows have no age and were dropped, leaving 714 passengers.

The result is pedagogically better than iris precisely because it is *worse*:
around 74% for a decision tree and 65% for KNN, so there are real mistakes to
look at and a visible difference between models, instead of iris's flat 100%.

## Ideas not yet built

- **Side-by-side comparison.** Train two configurations at once — `k=1` versus
  `k=20` — so overfitting is something you *see* rather than get told about.
- **A deliberately bad preset.** Let people break the model on purpose and
  watch it fail. Understanding failure teaches more than understanding success.
- **Shareable results.** Encode the configuration in the URL so you can send
  someone "look what I got".
- **Regression and Neural Networks.** Promised by the footer and the concept
  picker, backed by nothing. Until they exist the cards stay disabled and Eve
  says she's still learning them (`eve_hiding.svg`).

## Colour system fixes

Building the Playground surfaced gaps in the in-progress colour refactor:

- Dark mode was missing nine tokens that light mode defines
  (`--color-accent-light`, `--color-border`, `--color-primary-10..30`, …), so
  anything using them fell back to nothing and rendered transparent.
- `--card-background` in dark mode was still the near-white light-mode value,
  which put near-white text on a near-white panel.
- `--color-primary` was `35%` lightness in dark mode — same as light mode,
  contradicting the block's own comment ("lighter/more vibrant in dark mode").
  Now `65%`, so it stays readable on dark surfaces.
- `--color-text-light` is referenced by the navbar and FeatureCard but only
  existed in the dead `index_old.css`. Now defined in `:root`.
- `--color-accent-dark` settled at `40%` lightness: Eve's speech bubble and the
  selected model card both carry white text, and 40% is where they clear the
  4.5:1 contrast minimum in both themes. Eve's bubble is a shade darker than
  the Figma as a result — the design's lighter blue measured about 2.6:1 with
  white text, which is hard to read, and the bubble is where the teaching
  happens.

## Seeing the method, not just the score

**Decision: every model gets its decision boundary drawn.**
`POST /decision-surface` fits the chosen model on two columns and predicts
across a 120×120 grid; the frontend blits that to a canvas and draws the real
data over it. It sits in the tinker stage between the model cards and the
settings, and redraws live — swapping a tree for KNN turns rectangles into
islands in front of you.

This is the answer to "the four models all look the same to me". Their scores
on Titanic sit within a few points of each other, so the numbers say the choice
barely matters; the pictures say the opposite, and the pictures are the lesson.

Three things this forced, all of which are the interesting part:

- **No smoothing when scaling up.** A tree's boundary really is a hard-edged
  staircase. Interpolating it into a gradient draws a model that does not exist,
  so the canvas is `image-rendering: pixelated` and the resolution carries the
  crispness instead.
- **The axes are chosen for you.** A quick tree ranks the columns by importance
  and the best two are used. Asking a newcomer to pick two axes before they have
  seen anything is the control-panel mistake again, one layer down. They stay
  changeable, they are just never a gate.
- **The camera is not the data.** Scaled to Titanic's true maximum fare (£512,
  against a £16 median) nine tenths of the passengers sat in the bottom sixth of
  the plot. The view is now cut at Tukey's fence, held back so it never hides
  more than the outermost 5%; points outside are pinned to the edge and counted
  in the caption, never dropped. The model still trains on every row.

**The two-column model is a different model, and the UI says so.** It sees two
things about each passenger instead of six, and scores lower — 85 of 143 on age
and fare against 103 with everything. The caption states this outright rather
than letting the picture imply it re-runs the experiment.

**Colour:** the first three slots of a CVD-validated categorical palette, in
fixed order, checked against this site's own card surfaces in both themes on the
all-pairs gate (worst CVD ΔE 9.2 light / 9.4 dark). Three is the cap for a
scatter, which happens to be the most classes any dataset here has — a fourth
class needs a re-validated palette, not a fourth guessed hue. The legend names
every class, so identity never rests on colour alone.

**Not built: 3D.** A third axis needs WebGL and a rotation interaction, and it
buys less than it looks — the honest gain over two well-chosen columns is small,
and the cost is a dependency plus a control that a first-time visitor has to
learn before the picture means anything. Worth revisiting only if two columns
start feeling genuinely insufficient.

## Known issues

- `--color-text-tertiary` gives about 4.07:1 on light panels, marginally under
  the 4.5:1 minimum for small text. It is used site-wide, so changing it is a
  design decision rather than a fix to make in passing.
- `index_old.css` is dead and should be deleted once the colour work settles.
- `Flowinggridbackground.tsx` and `NeuralNetworkBackground.tsx` are written but
  unused — the hero has its background commented out.
- CORS is `allow_origins=["*"]`, fine locally, needs narrowing before deploy.
- `/learn` and `/about` both render the same "Eve is still unpacking" box, so
  two of the three nav links are dead ends. `MovingBox.png` behind it is 2MB,
  and is a screenshot of Figma component placeholders — it reads as unfinished
  rather than as coming soon.
- The footer's LinkedIn and GitHub are plain text, not links.
- `Home.tsx` still shows the "backend is up and running" toast to every visitor.
  It is marked "remove in production" in the code; worth doing before sharing
  the link, since it is developer noise on a page aimed at family.
