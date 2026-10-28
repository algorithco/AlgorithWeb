const env = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const siteConfig = {
  name: "Algorithco",
  siteUrl: env(process.env.NEXT_PUBLIC_SITE_URL, "https://algorithco.trqsh.uz"),
  authUrl: new URL(
    "/signin",
    env(process.env.NEXT_PUBLIC_SITE_URL, "https://algorithco.trqsh.uz"),
  ).toString(),
  accountUrl: new URL(
    "/app/account",
    env(process.env.NEXT_PUBLIC_SITE_URL, "https://algorithco.trqsh.uz"),
  ).toString(),
  contactEmail: env(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    "hello@algorithco.com",
  ),
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
