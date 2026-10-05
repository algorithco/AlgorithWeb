const env = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const siteConfig = {
  name: "Algorithco",
  siteUrl: env(process.env.NEXT_PUBLIC_SITE_URL, "https://trqsh.uz"),
  authUrl: new URL(
    "/signin",
    env(process.env.NEXT_PUBLIC_SITE_URL, "https://trqsh.uz"),
  ).toString(),
  accountUrl: new URL(
    "/account/",
    env(process.env.NEXT_PUBLIC_SITE_URL, "https://trqsh.uz"),
  ).toString(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
