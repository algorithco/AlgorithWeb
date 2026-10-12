import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChangelogView } from "@/components/changelog/changelog-view";
import { changelogStreams, getChangelogStream } from "@/config/changelog";

type Props = { params: Promise<{ stream: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return changelogStreams.map((stream) => ({ stream: stream.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stream = getChangelogStream((await params).stream);
  if (!stream) return {};
  return {
    title: `${stream.name} changelog`,
    description: `What changed in ${stream.name}, release by release.`,
    alternates: { canonical: `/changelog/${stream.slug}` },
  };
}

export default async function StreamChangelogPage({ params }: Props) {
  const stream = getChangelogStream((await params).stream);
  if (!stream) notFound();
  return <ChangelogView stream={stream} />;
}
