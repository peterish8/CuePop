"use client";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="grid min-h-svh place-items-center bg-[#050507] p-5 text-center text-white"><div><div className="mx-auto size-3 rounded-full bg-[var(--danger)] shadow-[0_0_24px_rgba(255,127,135,.4)]"/><h1 className="mt-7 text-3xl font-semibold tracking-[-.04em]">CuePop lost this moment.</h1><p className="mt-3 max-w-md text-sm leading-6 text-[#7f8993]">The live service may be reconnecting. Try the action again without refreshing other room surfaces.</p><Button className="mt-7" onClick={reset}><RotateCw className="size-4"/>Try again</Button></div></main>}
