import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CuePopLogo } from "@/components/logo";
export default function NotFound(){return <main className="grid min-h-svh place-items-center bg-[#050507] p-5 text-center text-white"><div><CuePopLogo className="justify-center"/><div className="mt-12 text-[8rem] font-semibold leading-none tracking-[-.08em] text-white/[.08]">404</div><h1 className="-mt-4 text-3xl font-semibold tracking-[-.04em]">This moment is not in the deck.</h1><p className="mt-3 text-[#7f8993]">The page or live room may have moved or ended.</p><Button asChild className="mt-7"><Link href="/"><ArrowLeft className="size-4"/>Back to CuePop</Link></Button></div></main>}
