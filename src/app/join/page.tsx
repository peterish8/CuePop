"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CuePopLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roomAlphabet = /[^A-HJ-NP-Z2-9]/g;

export default function JoinByCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <main className="grid min-h-svh place-items-center bg-[#07090c] p-5 text-white">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length === 6) router.push(`/join/${code}`);
        }}
        className="cue-panel w-full max-w-sm p-6"
      >
        <CuePopLogo />
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.045em]">Join a room.</h1>
        <p className="mt-3 text-sm leading-6 text-[#7e8993]">
          Enter the six-character code shown on the projector.
        </p>
        <Input
          className="mt-7 h-14 text-center text-xl font-semibold uppercase tracking-[.18em]"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase().replace(roomAlphabet, "").slice(0, 6))}
          placeholder="K8M4Q2"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          aria-label="Room code"
          autoFocus
        />
        <Button className="mt-3 w-full" size="lg" variant="accent" disabled={code.length !== 6}>
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </main>
  );
}
