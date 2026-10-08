# Motion system

All animation lives in one layer so it stays consistent and easy to tune.

| Piece | Where |
|---|---|
| Durations / easings (`--dur-*`, `--ease-*`, `--stagger`) | `src/app/tokens.css` |
| Every animation rule | `src/app/motion.css` (loaded after `globals.css`) |
| Scroll reveal, pointer spotlight, tilt | `src/components/motion-controller.tsx` |
| Route transitions | `src/app/template.tsx`, `src/app/products/template.tsx` |
| Word-by-word headings | `src/components/split-words.tsx` |
| Counting numbers | `src/components/animated-number.tsx` |
| Circular theme reveal | `src/components/theme-toggle.tsx` |

## Authoring rules

- Animate `transform`, `opacity` and `clip-path` only. Never animate layout properties.
- Use the duration and easing tokens instead of literals.
- Scroll-driven effects (`animation-timeline`) are progressive enhancement: wrap them in `@supports` and `prefers-reduced-motion: no-preference`.
- `prefers-reduced-motion: reduce` is handled once, at the end of `motion.css`: durations collapse to ~0 and view transitions are disabled, but every state change still happens. Do not add per-component reduced-motion rules unless an effect needs to be removed outright.

## Attributes and components

- `data-reveal` fades a block up when it scrolls into view. Variants: `data-reveal="fade"` (opacity only) and `data-reveal="scale"`.
- `data-stagger` on a container reveals its direct children one after another (up to eight steps). It uses animations, not transitions, so children keep their own hover transitions. Do not combine it with `data-reveal` on the children.
- `data-spotlight` makes an element track the pointer (`--mx` / `--my`). Dashboard cards are matched by class in `motion-controller.tsx`, so they need no attribute.
- `<SplitWords text="…" />` inside a `data-reveal` ancestor renders a heading whose words rise out of a mask. Give the heading `aria-label` and wrap the output in `aria-hidden`.
- `<AnimatedNumber value={n} />` counts up to an integer.

## Route transitions

`template.tsx` wraps pages in React's `<ViewTransition>`; `motion.css` styles the `page-enter` / `page-exit` classes. The header and footer carry `view-transition-name`s so they stay put. Templates only remount when their own segment changes, which is why `/products/*` has its own template. The dashboard does not use view transitions; its panels animate in with CSS when a page mounts.

During client-side navigation, content that is already on screen is revealed instantly (`data-instant`) because the route transition provides the entrance. On first load it animates as it scrolls into view.

Browsers without View Transitions or scroll-driven animations simply skip those effects.

## Previewing the dashboard without signing in

Add `NEXT_PUBLIC_DASHBOARD_PREVIEW=visual-qa` to a git-ignored `.env.development.local` and run `pnpm dev`. `PlatformAuthBoundary` then renders the dashboard with a mock profile. API calls fail in this mode, so data panels show their loading or error states. Remove the file afterwards; it must never be set in a production build.
