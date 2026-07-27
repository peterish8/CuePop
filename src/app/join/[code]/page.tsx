import type { Metadata } from "next";
import { AttendeeView } from "@/components/live/attendee-view";
export const metadata:Metadata={title:"Join session",robots:{index:false,follow:false}};
export default async function JoinPage({params}:{params:Promise<{code:string}>}){const {code}=await params;return <AttendeeView code={code.toUpperCase()}/>}
