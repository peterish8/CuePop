import { describe, expect, it } from "vitest";
import { deckItemCreateSchema, validateDeckItemState } from "@/lib/deck-validation";

describe("deck item validation", () => {
  it("requires local image URLs for slides", () => {
    expect(
      deckItemCreateSchema.safeParse({
        type: "slide",
        title: "Opening",
        imageUrl: "https://example.com/slide.png",
      }).success,
    ).toBe(false);
  });

  it("requires exactly one correct answer for quizzes", () => {
    const base = {
      type: "quiz" as const,
      question: "Which answer is correct?",
      options: [
        { id: "a", label: "Alpha" },
        { id: "b", label: "Beta" },
      ],
    };

    expect(validateDeckItemState(base)).toBe("Quizzes need exactly one correct answer.");
    expect(
      validateDeckItemState({
        ...base,
        options: [
          { id: "a", label: "Alpha", isCorrect: true },
          { id: "b", label: "Beta" },
        ],
      }),
    ).toBeNull();
  });

  it("rejects duplicate option identifiers", () => {
    const result = deckItemCreateSchema.safeParse({
      type: "poll",
      title: "Room pulse",
      question: "How are you feeling?",
      options: [
        { id: "same", label: "Ready" },
        { id: "same", label: "Unsure" },
      ],
    });
    expect(result.success).toBe(false);
  });
});
