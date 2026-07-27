"use client";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <PageShell center><div><div className="mx-auto size-3 rounded-full bg-[var(--color-danger)] shadow-[0_0_24px_rgba(255,127,135,.4)]"/><h1 className="mt-7 text-3xl font-semibold tracking-[-.04em]">CuePop lost this moment.</h1><p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-foreground-subtle)]">The live service may be reconnecting. Try the action again without refreshing other room surfaces.</p><Button className="mt-7" onClick={reset}><RotateCw className="size-4"/>Try again</Button></div></PageShell>}
