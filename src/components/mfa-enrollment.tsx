"use client";

import { useId, useMemo, useState } from "react";
import {
  buildQrSvg,
  groupSetupKey,
  RECOVERY_CODES_FILENAME,
  recoveryCodesText,
} from "@/lib/mfa-setup";

export type Enrollment = { uri: string; key: string; recoveryCodes: string[] };

export function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="account-copy__button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function DownloadCodesButton({ codes }: { codes: string[] }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      className="account-copy__button"
      aria-label="Download recovery codes as a text file"
      onClick={() => {
        const blob = new Blob([recoveryCodesText(codes, new Date())], {
          type: "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = RECOVERY_CODES_FILENAME;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      }}
    >
      {saved ? "Downloaded" : "Download"}
    </button>
  );
}

/** Rendered locally: the URI holds the TOTP secret and never leaves the page. */
function QrCode({ value }: { value: string }) {
  const qr = useMemo(() => buildQrSvg(value), [value]);
  if (!qr) return null;
  const [x, y, width, height] = qr.viewBox.split(" ");
  return (
    <svg
      className="mfa-qr__svg"
      viewBox={qr.viewBox}
      role="img"
      aria-label="QR code for your authenticator app"
      shapeRendering="crispEdges"
    >
      <rect x={x} y={y} width={width} height={height} fill="#fff" />
      <path d={qr.path} fill="#000" />
    </svg>
  );
}

export function MfaEnrollment({
  enrollment,
  code,
  onCodeChange,
  savedCodes,
  onSavedCodesChange,
  disabled,
}: {
  enrollment: Enrollment;
  code: string;
  onCodeChange: (value: string) => void;
  savedCodes: boolean;
  onSavedCodesChange: (value: boolean) => void;
  disabled: boolean;
}) {
  const id = useId();
  // Only hand an otpauth: URI to the browser; never an arbitrary scheme.
  const openLink = enrollment.uri.startsWith("otpauth://")
    ? enrollment.uri
    : null;

  return (
    <div className="mfa-enroll">
      <section className="mfa-step" aria-labelledby={`${id}-scan`}>
        <h3 id={`${id}-scan`} className="mfa-step__title">
          <span className="mfa-step__num" aria-hidden="true">
            1
          </span>
          Scan with your authenticator app
        </h3>
        <div className="mfa-scan">
          <div className="mfa-qr">
            <QrCode value={enrollment.uri} />
          </div>
          <div className="mfa-scan__side">
            <p>
              Open an authenticator app such as Google Authenticator, 1Password
              or Authy and scan this code.
            </p>
            {openLink ? (
              <a className="button button--secondary mfa-open" href={openLink}>
                Open in authenticator app
              </a>
            ) : null}
            <div className="mfa-manual">
              <span id={`${id}-key`}>Can&rsquo;t scan? Enter this key:</span>
              <span className="account-mfa-key">
                <code aria-labelledby={`${id}-key`}>
                  {groupSetupKey(enrollment.key)}
                </code>
                <CopyButton label="setup key" value={enrollment.key} />
              </span>
              <small>Time-based, 6 digits, 30 seconds.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="mfa-step" aria-labelledby={`${id}-recovery`}>
        <h3 id={`${id}-recovery`} className="mfa-step__title">
          <span className="mfa-step__num" aria-hidden="true">
            2
          </span>
          Save your recovery codes
        </h3>
        <p className="mfa-step__hint">
          Each code works once if you lose your device. They are not shown
          again.
        </p>
        <ul className="account-recovery-codes">
          {enrollment.recoveryCodes.map((item) => (
            <li key={item}>
              <code>{item}</code>
            </li>
          ))}
        </ul>
        <div className="mfa-step__tools">
          <CopyButton
            label="recovery codes"
            value={enrollment.recoveryCodes.join("\n")}
          />
          <DownloadCodesButton codes={enrollment.recoveryCodes} />
        </div>
        <label className="mfa-check">
          <input
            type="checkbox"
            checked={savedCodes}
            disabled={disabled}
            onChange={(event) => onSavedCodesChange(event.target.checked)}
          />
          <span>I&rsquo;ve saved my recovery codes somewhere safe.</span>
        </label>
      </section>

      <section className="mfa-step" aria-labelledby={`${id}-confirm`}>
        <h3 id={`${id}-confirm`} className="mfa-step__title">
          <span className="mfa-step__num" aria-hidden="true">
            3
          </span>
          Enter the 6-digit code
        </h3>
        <input
          id="account-mfa-confirm"
          className="account-password-dialog__code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          aria-labelledby={`${id}-confirm`}
          maxLength={6}
          value={code}
          disabled={disabled}
          onChange={(event) =>
            onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
      </section>
    </div>
  );
}
