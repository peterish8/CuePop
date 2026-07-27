import type { Metadata } from "next";
import { RemoteControl } from "@/components/live/remote-control";
export const metadata:Metadata={title:"Phone remote",robots:{index:false,follow:false}};
export default async function RemotePage({params,searchParams}:{params:Promise<{code:string}>;searchParams:Promise<{token?:string}>}){const [{code},{token}]=await Promise.all([params,searchParams]);return <RemoteControl code={code.toUpperCase()} token={token||""}/>}
