const env = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

const authOrigin = env(
  process.env.NEXT_PUBLIC_AUTH_URL,
  "https://auth.algorithco.com",
);

export const siteConfig = {
  name: "Algorithco",
  siteUrl: env(process.env.NEXT_PUBLIC_SITE_URL, "https://algorithco.com"),
  authUrl: new URL("/signin", authOrigin).toString(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
