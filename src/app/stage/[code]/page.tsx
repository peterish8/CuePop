import type { Metadata } from "next";
import { StageView } from "@/components/live/stage-view";
export const metadata:Metadata={title:"Live stage",robots:{index:false,follow:false}};
export default async function StagePage({params}:{params:Promise<{code:string}>}){const {code}=await params;return <StageView code={code.toUpperCase()}/>}
