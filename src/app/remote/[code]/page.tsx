import type { Metadata } from "next";
import { RemoteControl } from "@/components/live/remote-control";
export const metadata:Metadata={title:"Phone remote",robots:{index:false,follow:false}};
export default async function RemotePage({params}:{params:Promise<{code:string}>}){const {code}=await params;return <RemoteControl code={code.toUpperCase()}/>}
