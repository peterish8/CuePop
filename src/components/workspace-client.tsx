'use client';

import Link from 'next/link';
import {useRef, useState} from 'react';
import type {ChangeEvent, FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  ImageIcon,
  MoreHorizontal,
  Plus,
  Radio,
  Sparkles,
  Upload,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toast} from '@/components/ui/toaster';
import {EmptyState} from '@/components/patterns/empty-state';
import {PageHeader} from '@/components/patterns/page-header';
import {StatCard} from '@/components/patterns/stat-card';
import type {Deck} from '@/lib/schema';
import {formatDate} from '@/lib/utils';

interface WorkspaceClientProps {
  initialDecks: Deck[];
}

interface DeckApiBody {
  data?: Deck;
  error?: string;
}

function isDeckApiBody(value: unknown): value is DeckApiBody {
  return typeof value === 'object' && value !== null;
}

async function readDeckApiBody(response: Response): Promise<DeckApiBody> {
  const body: unknown = await response.json();
  return isDeckApiBody(body) ? body : {};
}

/** Renders the signed-in workspace and handles creating and importing decks. */
export function WorkspaceClient({initialDecks}: WorkspaceClientProps) {
  const router = useRouter();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [decks, setDecks] = useState(initialDecks);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [title, setTitle] = useState('');

  async function createDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({title: trimmedTitle}),
      });
      const body = await readDeckApiBody(response);
      const createdDeck = body.data;
      if (!response.ok || !createdDeck) {
        throw new Error(body.error ?? 'Could not create this deck.');
      }

      setDecks((currentDecks) => [createdDeck, ...currentDecks]);
      setTitle('');
      router.push(`/workspace/decks/${createdDeck.id}`);
    } catch (error) {
      toast({
        title: 'Could not create deck',
        description: error instanceof Error ? error.message : 'Try again.',
        tone: 'error',
      });
    } finally {
      setCreating(false);
    }
  }

  async function importDeck(file: File) {
    setImporting(true);
    try {
      const response = await fetch('/api/decks/import', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: await file.text(),
      });
      const body = await readDeckApiBody(response);
      const importedDeck = body.data;
      if (!response.ok || !importedDeck) {
        throw new Error(body.error ?? 'Import failed.');
      }

      toast({
        title: 'Deck imported',
        description: 'A fresh copy is ready in this workspace.',
      });
      router.push(`/workspace/decks/${importedDeck.id}`);
    } catch (error) {
      toast({
        title: 'Could not import deck',
        description: error instanceof Error ? error.message : 'Choose a Deckactive export.',
        tone: 'error',
      });
    } finally {
      setImporting(false);
    }
  }

  function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void importDeck(file);
    }
    event.target.value = '';
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Your presentation workspace"
        title="Build once. Run the room."
        description="Upload image slides, place audience moments exactly where they belong and rehearse all four live surfaces before the event."
        actions={
          <div className="flex w-full max-w-lg gap-2">
            <form className="flex min-w-0 flex-1 gap-2" onSubmit={createDeck}>
              <Input
                aria-label="New deck title"
                disabled={creating}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="New deck title"
                value={title}
              />
              <Button disabled={!title.trim()} loading={creating} variant="primary">
                <Plus className="size-4" />
                Create
              </Button>
            </form>
            <input
              accept="application/json,.json,.deckactive.json,.cuepop.json"
              aria-label="Import a Deckactive deck file"
              className="sr-only"
              onChange={handleImportChange}
              ref={importInputRef}
              type="file"
            />
            <Button
              loading={importing}
              onClick={() => importInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              <Upload className="size-4" />
              Import
            </Button>
          </div>
        }
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard icon={ImageIcon} label="Decks" value={decks.length} />
        <StatCard icon={Radio} label="Realtime room" value="Ready" />
        <StatCard icon={Sparkles} label="Keepsake designs" value="3" />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="cue-h3">Recent decks</h2>
            <p className="cue-body-sm mt-1">Continue editing or start a live rehearsal.</p>
          </div>
        </div>
        {decks.length === 0 ? (
          <EmptyState
            className="mt-6"
            description="Start with a title, then upload images and insert a poll."
            icon={Plus}
            title="Create your first live deck"
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {decks.map((deck, index) => (
              <Link
                className="group cue-hover-card cue-panel relative overflow-hidden p-5"
                href={`/workspace/decks/${deck.id}`}
                key={deck.id}
              >
                <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_70%_50%,rgba(65,105,225,.11),transparent_65%)] opacity-70" />
                <div className="relative flex gap-4">
                  <DeckPreview />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="cue-caption text-[var(--color-primary-hover)]">
                          {index === 0 ? 'Recently edited' : 'Draft'}
                        </div>
                        <h3 className="mt-2 truncate text-lg font-semibold tracking-[-.025em]">{deck.title}</h3>
                      </div>
                      <MoreHorizontal className="size-4 text-[var(--color-foreground-subtle)]" />
                    </div>
                    <p className="cue-body-sm mt-2 line-clamp-2">
                      {deck.description || 'Image-first deck ready for slides and live moments.'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-foreground-subtle)]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {formatDate(deck.updatedAt)}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[var(--color-foreground-muted)] group-hover:text-white">
                        Open <ArrowUpRight className="cue-hover-arrow size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DeckPreview() {
  return (
    <div className="cue-hover-icon grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="relative h-full w-full">
        <div className="absolute inset-x-3 top-3 h-1.5 rounded-full bg-white/[.12]" />
        <div className="absolute left-3 top-8 h-8 w-14 rounded bg-[rgba(65,105,225,.18)]" />
        <div className="absolute right-3 top-8 h-8 w-10 rounded bg-white/[.06]" />
        <div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/[.08]" />
      </div>
    </div>
  );
}
