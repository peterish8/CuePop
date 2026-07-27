import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CuePopLogo } from "@/components/logo";
import { PageShell } from "@/components/layout/page-shell";
export default function NotFound(){return <PageShell center><div><CuePopLogo className="justify-center"/><div className="mt-12 text-[8rem] font-semibold leading-none tracking-[-.08em] text-white/[.08]">404</div><h1 className="-mt-4 text-3xl font-semibold tracking-[-.04em]">This moment is not in the deck.</h1><p className="mt-3 text-[var(--color-foreground-subtle)]">The page or live room may have moved or ended.</p><Button asChild className="mt-7"><Link href="/"><ArrowLeft className="size-4"/>Back to CuePop</Link></Button></div></PageShell>}
