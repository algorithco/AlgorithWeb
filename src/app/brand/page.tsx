import { statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CopyValue } from "@/components/brand/copy-value";
import { AlgorithcoMark, VoiceMark } from "@/components/brand-marks";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { siteConfig } from "@/config/site";
import {
  brandAllowed,
  brandColor,
  brandColors,
  brandFormats,
  brandKit,
  brandMarks,
  brandMisuse,
  brandNames,
  brandNotAllowed,
  colorPairs,
  themeColors,
} from "@/content/brand";
import {
  contrastGrade,
  contrastRatio,
  formatHex,
  formatRgb,
} from "@/lib/color";

export const metadata: Metadata = {
  title: "Brand",
  description:
    "The Algorithco and AlgorithVoice logos to download, the brand colors with their values, and the rules for using them.",
  alternates: { canonical: "/brand" },
};

const SECTIONS = [
  ["logos", "Logos"],
  ["names", "Names"],
  ["colors", "Colors"],
  ["usage", "Usage"],
  ["permission", "Permission"],
] as const;

const MARKS = { algorithco: AlgorithcoMark, voice: VoiceMark };

// The smallest a mark may be shown, then two sizes it is usually seen at.
const SIZES = [16, 32, 48];

const ink = brandColor("Ink");
const white = brandColor("White");

/** Ink or white, whichever reads better on the color. */
function textOn(hex: string) {
  return contrastRatio(ink, hex) >= contrastRatio(white, hex) ? ink : white;
}

// The page is built once (it is a static export), so the size is read then.
const kitSize = `${Math.round(
  statSync(path.join(process.cwd(), "public", brandKit.href)).size / 1000,
)} KB`;
const kitFiles =
  brandMarks.reduce((count, mark) => count + mark.assets.length, 0) *
  brandFormats.length;

export default function BrandPage() {
  return (
    <>
      <PageHero
        eyebrow="Brand"
        title="Marks and colors, ready to use."
        description="The Algorithco and AlgorithVoice marks, the colors we build with, and the few rules that come with them. Take what you need."
      />

      <section className="brand-kit" data-reveal="fade">
        <Container className="brand-kit__inner">
          <div className="brand-kit__download">
            <a className="button button--primary" download href={brandKit.href}>
              <span>Download the brand kit</span>
              <span aria-hidden="true" className="button__mark">
                ↓
              </span>
            </a>
            <small>
              {brandKit.fileName} · {kitFiles} files · {kitSize}
            </small>
          </div>
          <nav aria-label="On this page" className="brand-kit__nav">
            {SECTIONS.map(([id, label]) => (
              <a href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <Section
        eyebrow="Logos"
        id="logos"
        title="Two marks, in black and white."
      >
        <p className="brand-lead">
          Each mark comes in black for light backgrounds, in white for dark
          ones, and as an icon on a black tile. There are no other versions.
        </p>
        <div className="brand-marks">
          {brandMarks.map((mark) => {
            const Mark = MARKS[mark.slug];
            return (
              <article className="brand-mark" key={mark.slug}>
                <div className="brand-mark__intro">
                  <h3>{mark.name}</h3>
                  <p>{mark.note}</p>
                </div>
                <ul className="brand-mark__tiles" data-stagger>
                  {mark.assets.map((asset) => (
                    <li className="brand-tile" key={asset.file}>
                      <div
                        aria-hidden="true"
                        className={`brand-tile__stage brand-tile__stage--${asset.stage}`}
                      >
                        {asset.stage === "icon" ? (
                          <span className="brand-tile__icon">
                            <Mark />
                          </span>
                        ) : (
                          <Mark />
                        )}
                      </div>
                      <div className="brand-tile__caption">
                        <p>
                          <strong>{asset.label}</strong>
                          <span>{asset.use}</span>
                        </p>
                        <div className="brand-tile__files">
                          {brandFormats.map((format) => (
                            <a
                              aria-label={`Download ${mark.name}, ${asset.label.toLowerCase()}, as ${format.toUpperCase()}`}
                              className="brand-file"
                              download
                              href={`/brand/${asset.file}.${format}`}
                              key={format}
                            >
                              {format.toUpperCase()}
                              <span aria-hidden="true">↓</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
          <article className="brand-mark">
            <div className="brand-mark__intro">
              <h3>AlgorithGuard</h3>
              <p>
                AlgorithGuard has no mark of its own. Write its name in full;
                where it needs a color, that color is yellow.
              </p>
            </div>
            <p aria-hidden="true" className="brand-guard">
              <span className="brand-dot" />
              AlgorithGuard
            </p>
          </article>
        </div>
      </Section>

      <Section eyebrow="Names" id="names" title="One word each.">
        <ul className="brand-names">
          {brandNames.map((item) => (
            <li key={item.slug}>
              <p aria-hidden="true" className="brand-name__lockup">
                {item.slug === "algorithco" ? (
                  <span className="brand-name__tile">
                    <AlgorithcoMark />
                  </span>
                ) : item.slug === "voice" ? (
                  <VoiceMark className="brand-name__bars" />
                ) : (
                  <span className="brand-dot" />
                )}
                {item.lockup}
              </p>
              <div className="brand-name__body">
                <p className="brand-name__rule">
                  <strong>{item.name}</strong>
                  {item.note}
                </p>
                <p className="brand-name__avoid">
                  <span>Not</span>
                  {item.avoid.map((wrong) => (
                    <s key={wrong}>{wrong}</s>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Colors" id="colors" title="Ink, paper and one yellow.">
        <p className="brand-lead">
          Nearly everything we make is ink on paper. Yellow is the only accent,
          and a little of it goes a long way. Press a value to copy it.
        </p>
        <ul className="brand-swatches" data-stagger>
          {brandColors.map((color) => (
            <li
              className="brand-swatch"
              key={color.name}
              style={
                {
                  "--swatch": color.hex,
                  "--swatch-text": textOn(color.hex),
                } as CSSProperties
              }
            >
              <div className="brand-swatch__chip">
                <h3>{color.name}</h3>
              </div>
              <div className="brand-swatch__body">
                <p>{color.role}</p>
                <dl>
                  <div>
                    <dt>HEX</dt>
                    <dd>
                      <CopyValue
                        label={`${color.name} HEX`}
                        value={formatHex(color.hex)}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>RGB</dt>
                    <dd>
                      <CopyValue
                        label={`${color.name} RGB`}
                        value={formatRgb(color.hex)}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>

        <div className="brand-block">
          <div className="brand-block__intro">
            <h3>Text on color</h3>
            <p>
              Yellow carries ink, never white. The figure is the contrast
              between the two colors: text needs 4.5 or more to be read with
              ease.
            </p>
          </div>
          <ul className="brand-pairs">
            {colorPairs.map((pair) => {
              const text = brandColor(pair.text);
              const ground = brandColor(pair.ground);
              const ratio = contrastRatio(text, ground);
              const grade = contrastGrade(ratio);
              return (
                <li key={`${pair.text}-${pair.ground}`}>
                  <div
                    aria-hidden="true"
                    className={`brand-pair__sample${grade ? "" : " brand-strike"}`}
                    style={{ background: ground, color: text }}
                  >
                    Aa
                  </div>
                  <p>
                    <strong>
                      {pair.text} on {pair.ground.toLowerCase()}
                    </strong>
                    <span>
                      {ratio.toFixed(1)}:1 · {grade ?? "Do not use"}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="brand-block">
          <div className="brand-block__intro">
            <h3>In both themes</h3>
            <p>
              Every color this site is built with, in the light theme and the
              dark one.
            </p>
          </div>
          <table className="brand-table">
            <caption className="sr-only">
              The colors of the interface in the light and the dark theme
            </caption>
            <thead>
              <tr>
                <th scope="col">Used for</th>
                <th scope="col">Light</th>
                <th scope="col">Dark</th>
              </tr>
            </thead>
            <tbody>
              {themeColors.map((color) => (
                <tr key={color.token}>
                  <th scope="row">{color.role}</th>
                  <td>
                    <CopyValue
                      label={`${color.role}, light theme`}
                      swatch={color.light}
                      value={formatHex(color.light)}
                    />
                  </td>
                  <td>
                    <CopyValue
                      label={`${color.role}, dark theme`}
                      swatch={color.dark}
                      value={formatHex(color.dark)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Usage" id="usage" title="Use them as they are.">
        <div className="brand-guides" data-stagger>
          <figure className="brand-guide">
            <div aria-hidden="true" className="brand-guide__stage">
              <div className="brand-clear">
                <span className="brand-clear__gap brand-clear__gap--top">
                  ⅓
                </span>
                <span className="brand-clear__gap brand-clear__gap--side">
                  ⅓
                </span>
                <AlgorithcoMark />
              </div>
            </div>
            <figcaption>
              <h3>Clear space</h3>
              <p>
                Keep at least a third of the mark’s height free on every side.
                The icon already has this space built in.
              </p>
            </figcaption>
          </figure>
          <figure className="brand-guide">
            <div aria-hidden="true" className="brand-guide__stage">
              <ul className="brand-sizes">
                {SIZES.map((size) => (
                  <li
                    key={size}
                    style={{ "--size": `${size}px` } as CSSProperties}
                  >
                    <span>
                      <AlgorithcoMark />
                      <VoiceMark />
                    </span>
                    {size} px
                  </li>
                ))}
              </ul>
            </div>
            <figcaption>
              <h3>Smallest size</h3>
              <p>
                Never show a mark less than {SIZES[0]} pixels tall on a screen,
                or 5 millimeters tall in print.
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="brand-block">
          <div className="brand-block__intro">
            <h3>Leave them unchanged</h3>
            <p>
              The marks are finished. Use the files from this page as they are,
              at any size above the smallest.
            </p>
          </div>
          <ul className="brand-misuse">
            {brandMisuse.map((item) => (
              <li key={item.kind}>
                <div
                  aria-hidden="true"
                  className={`brand-misuse__stage brand-misuse__stage--${item.kind} brand-strike`}
                >
                  <AlgorithcoMark />
                </div>
                <p>{item.rule}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Permission"
        id="permission"
        title="What you may do with them."
      >
        <div className="brand-rules" data-stagger>
          <div className="brand-rule">
            <h3>Go ahead, no need to ask</h3>
            <ul>
              {brandAllowed.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="brand-rule brand-rule--no">
            <h3>Please do not</h3>
            <ul>
              {brandNotAllowed.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="brand-block">
          <div className="brand-block__intro">
            <h3>The fine print</h3>
            <p>Short, and in plain language.</p>
          </div>
          <dl className="faq-list brand-terms">
            <div>
              <dt>Who owns them</dt>
              <dd>
                The names Algorithco, AlgorithVoice and AlgorithGuard, and the
                marks on this page, belong to Algorithco. Downloading a file
                lets you use it as this page describes. It does not make it
                yours, and it gives you no other right to it.
              </dd>
            </div>
            <div>
              <dt>The colors</dt>
              <dd>
                We do not claim a color for ourselves, so use these values as
                you like. We only ask that you do not put them together with our
                marks or names to make your own work look like ours.
              </dd>
            </div>
            <div>
              <dt>When we may say no</dt>
              <dd>
                We can change these files and these rules, and we can ask you to
                stop a use that misleads people or goes against this page. If we
                ask, please take it down.
              </dd>
            </div>
            <div>
              <dt>Downloads and your privacy</dt>
              <dd>
                The files are plain downloads from this site: no sign-in, no
                form, and no script that counts them. Like any request to the
                site, a download appears in our web server’s standard logs, as
                the <Link href="/privacy">privacy policy</Link> describes.
              </dd>
            </div>
          </dl>
        </div>

        <div className="about-cta">
          <p>Need another format, or not sure a use is fine?</p>
          <ButtonLink href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
