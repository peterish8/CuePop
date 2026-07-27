import type { Metadata } from "next";
import { PresenterConsole } from "@/components/live/presenter-console";

export const metadata: Metadata = {
  title: "Presenter console",
  robots: { index: false, follow: false },
};

export default async function PresentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ code }, { token }] = await Promise.all([params, searchParams]);
  return <PresenterConsole code={code.toUpperCase()} token={token || ""} />;
}
