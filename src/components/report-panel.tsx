"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/patterns/stat-card";

type Report = {
  deckTitle: string;
  attendeeCount: number;
  startedAt: string;
  endedAt: string | null;
  moments: {
    itemId: string;
    type: string;
    question: string;
    totalResponses: number;
    participationRate: number;
    options: { label: string; count: number; isCorrect?: boolean }[];
  }[];
  answers: { attendeeName: string; itemId: string; answer: string; answeredAt: number }[];
};

export function ReportPanel({ code, token }: { code: string; token: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/live/${code}/report?token=${encodeURIComponent(token)}`)
      .then((response) => response.json())
      .then((body) => (body.ok ? setReport(body.data) : setError(body.error)))
      .catch(() => setError("Could not load report."));
  }, [code, token]);

  function exportCsv() {
    if (!report) return;

    const rows = [
      ["Question", "Type", "Responses", "Participation", "Option", "Votes"],
      ...report.moments.flatMap((moment) =>
        moment.options.map((option) => [
          moment.question,
          moment.type,
          String(moment.totalResponses),
          `${moment.participationRate}%`,
          option.label,
          String(option.count),
        ]),
      ),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `cuepop-${code}-report.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }

  function exportStudentAnswers() {
    if (!report) return;
    const questionById = new Map(report.moments.map((moment) => [moment.itemId, moment.question]));
    const rows = [["Student", "Question", "Answer", "Answered at"], ...report.answers.map((answer) => [answer.attendeeName, questionById.get(answer.itemId) || answer.itemId, answer.answer, new Date(answer.answeredAt).toISOString()])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `cuepop-${code}-student-answers.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  if (error) return <div className="text-sm text-[var(--color-danger)]">{error}</div>;
  if (!report) return <div className="cue-body-sm flex items-center gap-2"><Spinner />Preparing report…</div>;

  return (
    <div>
      <div className="space-y-3">
        <StatCard icon={Users} value={report.attendeeCount} label="Attendees joined" />
        <StatCard icon={BarChart3} value={report.moments.length} label="Live moments" tone="accent" />
      </div>

      <div className="mt-6 space-y-3">
        {report.moments.map((moment) => (
          <article
            key={moment.itemId}
            className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(65,105,225,.16),rgba(66,43,193,.09)_52%,rgba(255,255,255,.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan-strong)] to-transparent opacity-70" />
            <div className="absolute -right-12 -top-16 size-40 rounded-full bg-[radial-gradient(circle,rgba(89,76,255,.25),transparent_68%)]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <span className="cue-caption text-[var(--cyan-strong)]">{moment.type}</span>
                <span className="shrink-0 rounded-full border border-white/[.14] bg-[linear-gradient(110deg,rgba(65,105,225,.3),rgba(100,73,219,.28))] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_0_18px_rgba(65,105,225,.18)]">
                  {moment.participationRate}% joined
                </span>
              </div>

              <h3 className="mt-2 text-sm font-semibold leading-6 text-[var(--color-foreground)]">{moment.question}</h3>
              <p className="cue-caption mt-2 normal-case tracking-normal text-[var(--color-foreground-subtle)]">
                {moment.totalResponses} of {report.attendeeCount} responded
              </p>

              {moment.options.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  {moment.options.map((option, index) => {
                    const voteRate = moment.totalResponses ? (option.count / moment.totalResponses) * 100 : 0;
                    return (
                      <div key={`${moment.itemId}-${option.label}`}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate text-[var(--color-foreground-muted)]">{option.label}</span>
                          <span className="shrink-0 font-semibold text-[var(--color-foreground)]">{option.count}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--cyan-strong)] via-[var(--color-primary-hover)] to-[var(--violet-strong)] shadow-[0_0_12px_rgba(83,105,255,.55)]"
                            style={{ width: `${Math.max(voteRate, option.count ? 4 : 0)}%`, opacity: 1 - index * 0.08 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <Button className="mt-5 w-full" variant="secondary" onClick={exportCsv}>
        <Download className="size-4" />
        Export CSV
      </Button>
      <Button className="mt-2 w-full" variant="secondary" onClick={exportStudentAnswers}>
        <Download className="size-4" />Export student answers
      </Button>
    </div>
  );
}
