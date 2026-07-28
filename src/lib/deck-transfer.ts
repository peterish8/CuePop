import {z} from 'zod';
import {deckItemCreateSchema} from '@/lib/deck-validation';
import type {Deck} from '@/lib/schema';

const transferSchema = z
  .object({
    // CuePop is retained only as an import format so past exports remain usable.
    format: z.union([z.literal('deckactive-deck'), z.literal('cuepop-deck')]),
    version: z.literal(1),
    exportedAt: z.string().datetime(),
    deck: z.object({
      title: z.string().trim().min(2).max(100),
      description: z.string().trim().max(400),
      waitingMessage: z.string().trim().min(2).max(180),
      keepsakeThemes: z.array(z.enum(['signal', 'midnight', 'paper'])).min(1).max(3),
      items: z.array(deckItemCreateSchema).max(120),
    }),
  })
  .strict();

/** Creates the portable Deckactive file used for deck backup and transfer. */
export function createDeckTransfer(deck: Deck) {
  const items = (deck.items ?? [])
    .slice()
    .sort((firstItem, secondItem) => firstItem.position - secondItem.position)
    .map((item) => ({
      type: item.type,
      title: item.title,
      imageUrl: item.imageUrl,
      backgroundImageUrl: item.backgroundImageUrl,
      backgroundBlur: item.backgroundBlur,
      backgroundIntensity: item.backgroundIntensity,
      question: item.question,
      options: item.options,
      notes: item.notes,
      revealMode: item.revealMode,
    }));

  return {
    format: 'deckactive-deck' as const,
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    deck: {
      title: deck.title,
      description: deck.description,
      waitingMessage: deck.waitingMessage,
      keepsakeThemes: deck.keepsakeThemes,
      items,
    },
  };
}

/** Validates an untrusted deck-export file before it is imported. */
export function parseDeckTransfer(input: unknown) {
  return transferSchema.safeParse(input);
}
