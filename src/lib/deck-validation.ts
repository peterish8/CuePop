import { z } from "zod";
import type { DeckItem, DeckItemType, PollOption } from "@/lib/schema";

const localImageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value.startsWith("/api/media/") || value.startsWith("/art/"), "Slide images must use a Deckactive media URL.");

export const pollOptionSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(140),
  isCorrect: z.boolean().optional(),
});

const optionListSchema = z
  .array(pollOptionSchema)
  .max(8)
  .superRefine((options, context) => {
    const ids = new Set(options.map((option) => option.id));
    if (ids.size !== options.length) {
      context.addIssue({ code: "custom", message: "Option identifiers must be unique." });
    }
  });

export const deckItemCreateSchema = z.object({
  type: z.enum(["slide", "poll", "quiz"]),
  title: z.string().trim().min(1).max(120),
  imageUrl: localImageUrl.nullable().optional(),
  backgroundImageUrl: localImageUrl.nullable().optional(),
  backgroundBlur: z.number().int().min(0).max(24).optional(),
  backgroundIntensity: z.number().int().min(0).max(100).optional(),
  question: z.string().trim().max(240).nullable().optional(),
  options: optionListSchema.optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  revealMode: z.enum(["manual", "auto"]).optional(),
});

export const deckItemPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    imageUrl: localImageUrl.nullable().optional(),
    backgroundImageUrl: localImageUrl.nullable().optional(),
    backgroundBlur: z.number().int().min(0).max(24).optional(),
    backgroundIntensity: z.number().int().min(0).max(100).optional(),
    question: z.string().trim().max(240).nullable().optional(),
    options: optionListSchema.optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    revealMode: z.enum(["manual", "auto"]).optional(),
  })
  .strict();

export function validateDeckItemState(input: {
  type: DeckItemType;
  imageUrl?: string | null;
  question?: string | null;
  options?: PollOption[];
}) {
  if (input.type === "slide") {
    return input.imageUrl ? null : "Slides need an uploaded image.";
  }

  if (!input.question || input.question.trim().length < 3) {
    return "Polls and quizzes need a question.";
  }

  const options = input.options || [];
  if (options.length < 2) return "Polls and quizzes need at least two options.";

  if (input.type === "quiz") {
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) return "Quizzes need exactly one correct answer.";
  }

  return null;
}

export function mergedDeckItemState(current: DeckItem, patch: Partial<DeckItem>) {
  return {
    type: current.type,
    imageUrl: patch.imageUrl === undefined ? current.imageUrl : patch.imageUrl,
    backgroundImageUrl: patch.backgroundImageUrl === undefined ? current.backgroundImageUrl : patch.backgroundImageUrl,
    backgroundBlur: patch.backgroundBlur === undefined ? current.backgroundBlur : patch.backgroundBlur,
    backgroundIntensity: patch.backgroundIntensity === undefined ? current.backgroundIntensity : patch.backgroundIntensity,
    question: patch.question === undefined ? current.question : patch.question,
    options: patch.options === undefined ? current.options : patch.options,
  };
}
