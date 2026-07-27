"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import type { KeepsakeTheme } from "@/lib/schema";

const themes = {
  signal: { name: "Signal", bg: "#071015", accent: "#4d7fe0", text: "#f5f7f8" },
  midnight: { name: "Midnight", bg: "#0d0913", accent: "#b38d98", text: "#fbf7ff" },
  paper: { name: "Paper", bg: "#ece9e2", accent: "#1b5562", text: "#141618" },
} satisfies Record<KeepsakeTheme, { name: string; bg: string; accent: string; text: string }>;

export function KeepsakeDesigner({
  name,
  deckTitle,
  code,
  allowedThemes,
}: {
  name: string;
  deckTitle: string;
  code: string;
  allowedThemes: KeepsakeTheme[];
}) {
  const availableThemes = useMemo(
    () => allowedThemes.filter((theme, index) => theme in themes && allowedThemes.indexOf(theme) === index),
    [allowedThemes],
  );
  const fallbackTheme = availableThemes[0] || "signal";
  const canvas = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<KeepsakeTheme>(fallbackTheme);

  useEffect(() => {
    if (!availableThemes.includes(theme)) setTheme(fallbackTheme);
  }, [availableThemes, fallbackTheme, theme]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;

    const selectedTheme = themes[theme];
    element.width = 1080;
    element.height = 1350;
    context.fillStyle = selectedTheme.bg;
    context.fillRect(0, 0, element.width, element.height);

    const glow = context.createRadialGradient(830, 170, 20, 830, 170, 620);
    glow.addColorStop(0, `${selectedTheme.accent}55`);
    glow.addColorStop(1, `${selectedTheme.bg}00`);
    context.fillStyle = glow;
    context.fillRect(0, 0, element.width, element.height);

    context.strokeStyle = `${selectedTheme.accent}70`;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(80, 1020);
    context.bezierCurveTo(280, 920, 430, 1170, 650, 1010);
    context.bezierCurveTo(790, 900, 890, 930, 1000, 840);
    context.stroke();

    context.fillStyle = selectedTheme.accent;
    for (const [x, y] of [[80, 1020], [650, 1010], [1000, 840]]) {
      context.beginPath();
      context.arc(x, y, 8, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = selectedTheme.accent;
    context.font = "700 30px Inter, Arial";
    context.fillText("CUEPOP SESSION KEEPSAKE", 80, 110);

    context.fillStyle = selectedTheme.text;
    context.font = "650 78px Inter, Arial";
    wrapText(context, deckTitle, 80, 250, 900, 90, 3);

    context.font = "500 30px Inter, Arial";
    context.fillStyle = theme === "paper" ? "#4e5458" : "#aab3ba";
    context.fillText("This room was made participatory.", 80, 500);

    context.fillStyle = selectedTheme.text;
    drawFittedText(context, name || "Guest attendee", 80, 720, 900, 52, 34, 700);

    context.font = "500 26px Inter, Arial";
    context.fillStyle = theme === "paper" ? "#4e5458" : "#8d98a1";
    context.fillText(
      new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date()),
      80,
      770,
    );
    context.fillText(`Session ${code}`, 80, 815);

    context.fillStyle = selectedTheme.text;
    context.font = "700 32px Inter, Arial";
    context.fillText("CuePop", 80, 1240);
    context.textAlign = "right";
    context.font = "500 22px Inter, Arial";
    context.fillStyle = theme === "paper" ? "#555b5e" : "#77818a";
    context.fillText("You showed up. You joined in.", 1000, 1240);
    context.textAlign = "left";
  }, [theme, name, deckTitle, code]);

  function download() {
    const element = canvas.current;
    if (!element) return;
    const anchor = document.createElement("a");
    anchor.download = `cuepop-${code}-${theme}.png`;
    anchor.href = element.toDataURL("image/png");
    anchor.click();
    toast({ title: "Keepsake downloaded", description: "Saved as a high-resolution PNG." });
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-[var(--cyan)]" />
        Choose your keepsake
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[.09] bg-black">
        <canvas ref={canvas} className="block h-auto w-full" aria-label="Session keepsake preview" />
      </div>
      <div className={`mt-4 grid gap-2 ${availableThemes.length === 1 ? "grid-cols-1" : availableThemes.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {availableThemes.map((id) => {
          const item = themes[id];
          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`rounded-xl border p-2 text-xs font-semibold transition ${theme === id ? "border-[var(--cyan)] bg-[rgba(77,127,224,.07)]" : "border-white/[.08] bg-white/[.025]"}`}
            >
              <span className="mx-auto mb-2 block h-8 rounded-lg border border-black/10" style={{ background: item.bg }} />
              {item.name}
            </button>
          );
        })}
      </div>
      <Button className="mt-4 w-full" variant="accent" onClick={download}>
        <Download className="size-4" />
        Download PNG
      </Button>
    </div>
  );
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  let lineNumber = 1;

  for (const word of words) {
    const test = `${line}${word} `;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line.trim(), x, cursor);
      line = `${word} `;
      cursor += lineHeight;
      lineNumber += 1;
      if (lineNumber > maxLines) break;
    } else {
      line = test;
    }
  }
  if (lineNumber <= maxLines) context.fillText(line.trim(), x, cursor);
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  startingSize: number,
  minimumSize: number,
  weight: number,
) {
  let size = startingSize;
  do {
    context.font = `${weight} ${size}px Inter, Arial`;
    size -= 2;
  } while (context.measureText(text).width > maxWidth && size >= minimumSize);
  context.fillText(text, x, y);
}
