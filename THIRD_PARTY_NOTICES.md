# Third-party notices

AlgorithWeb is built on open-source software. Each component keeps its own
license; none of them is relicensed by this repository's
[AGPL-3.0-or-later](LICENSE).

The full list of packages and their licenses comes from the lockfile:

```bash
pnpm licenses list
```

Components worth naming:

| Component | License | Note |
| --- | --- | --- |
| Next.js, React and the packages around them | MIT | |
| Tailwind CSS | MIT | |
| Inter (`@fontsource-variable/inter`) | SIL Open Font License 1.1 | Font files are served as they are. |
| sharp and libvips (`@img/sharp-*`) | Apache-2.0 and LGPL-3.0-or-later | Optional image-optimizer binaries, used at build time only. They are not part of this repository's source. |

The speech models that AlgorithVoice downloads are not part of this
repository. Their licenses are listed on the AlgorithVoice documentation page
of the site and inside the app.

The logos and marks in `public/brand` are not covered by any of the above. See
[TRADEMARK.md](TRADEMARK.md).
