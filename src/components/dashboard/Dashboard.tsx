import { useState, useEffect, useCallback, useMemo } from "react";
import type { Deck, Flashcard, UserQuotaInfo } from "@/db/database.types";
import { DeckList } from "./DeckList";
import { DeckForm } from "./DeckForm";
import { FlashcardList } from "./FlashcardList";
import { FlashcardForm } from "./FlashcardForm";
import { AIGenerateForm } from "./AIGenerateForm";
import { AIPreviewDialog } from "./AIPreviewDialog";
import { MiniStats } from "./MiniStats";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { isDue } from "@/lib/services/spaced-repetition";

interface PreviewFlashcard {
  id: string;
  front: string;
  back: string;
}

interface DashboardProps {
  accessToken: string;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [quota, setQuota] = useState<UserQuotaInfo | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewCards, setPreviewCards] = useState<PreviewFlashcard[]>([]);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    },
    [accessToken]
  );

  const loadQuota = useCallback(async () => {
    try {
      const response = await fetchWithAuth("/api/user/quota");
      if (response.ok) {
        const { data } = await response.json();
        setQuota(data);
      }
    } catch {
      // Silently handle quota loading errors
    }
  }, [fetchWithAuth]);

  const loadDecks = useCallback(async () => {
    setDecksLoading(true);
    try {
      const response = await fetchWithAuth("/api/decks");
      if (response.ok) {
        const { data } = await response.json();
        setDecks(data || []);
      }
    } catch {
      // Silently handle deck loading errors
    } finally {
      setDecksLoading(false);
    }
  }, [fetchWithAuth]);

  const loadFlashcards = useCallback(
    async (deckId: string) => {
      setFlashcardsLoading(true);
      try {
        const response = await fetchWithAuth(`/api/flashcards?deck_id=${deckId}`);
        if (response.ok) {
          const { data } = await response.json();
          setFlashcards(data || []);
        }
      } catch {
        // Silently handle flashcard loading errors
      } finally {
        setFlashcardsLoading(false);
      }
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    loadDecks();
    loadQuota();
  }, [loadDecks, loadQuota]);

  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck.id);
    } else {
      setFlashcards([]);
    }
  }, [selectedDeck, loadFlashcards]);

  // Compute due cards count
  const dueCardsCount = useMemo(() => {
    return flashcards.filter((card) => isDue(card)).length;
  }, [flashcards]);

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
  };

  const handleCreateDeck = async (name: string, description: string) => {
    const response = await fetchWithAuth("/api/decks", {
      method: "POST",
      body: JSON.stringify({ name, description: description || undefined }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to create deck");
    }

    const { data } = await response.json();
    setDecks((prev) => [data, ...prev]);
    setSelectedDeck(data);
  };

  const handleDeleteDeck = async (id: string) => {
    const response = await fetchWithAuth(`/api/decks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to delete deck");
    }

    setDecks((prev) => prev.filter((d) => d.id !== id));
    if (selectedDeck?.id === id) {
      setSelectedDeck(null);
      setFlashcards([]);
    }
  };

  const handleEditDeck = async (id: string, name: string, description: string) => {
    const response = await fetchWithAuth(`/api/decks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description: description || undefined }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to update deck");
    }

    const { data } = await response.json();
    setDecks((prev) => prev.map((d) => (d.id === id ? data : d)));
    if (selectedDeck?.id === id) {
      setSelectedDeck(data);
    }
  };

  const handleCreateFlashcard = async (front: string, back: string) => {
    if (!selectedDeck) return;

    const response = await fetchWithAuth("/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ deck_id: selectedDeck.id, front, back }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to create flashcard");
    }

    const { data } = await response.json();
    setFlashcards((prev) => [data, ...prev]);
  };

  const handleDeleteFlashcard = async (id: string) => {
    const response = await fetchWithAuth(`/api/flashcards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to delete flashcard");
    }

    setFlashcards((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEditFlashcard = async (id: string, front: string, back: string) => {
    const response = await fetchWithAuth(`/api/flashcards/${id}`, {
      method: "PUT",
      body: JSON.stringify({ front, back }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to update flashcard");
    }

    const { data } = await response.json();
    setFlashcards((prev) => prev.map((f) => (f.id === id ? data : f)));
  };

  const handleGenerateFlashcards = async (text: string, count: number) => {
    if (!selectedDeck) return;

    const response = await fetchWithAuth("/api/generate-flashcards", {
      method: "POST",
      body: JSON.stringify({ text, deck_id: selectedDeck.id, count, preview: true }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to generate flashcards");
    }

    const { data } = await response.json();
    setPreviewCards(data);
    setPreviewDialogOpen(true);
  };

  const handleSavePreviewCards = async (cards: { front: string; back: string }[]) => {
    if (!selectedDeck) return;

    const response = await fetchWithAuth("/api/flashcards/bulk", {
      method: "POST",
      body: JSON.stringify({
        deck_id: selectedDeck.id,
        flashcards: cards,
        ai_generated: true,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to save flashcards");
    }

    const { data } = await response.json();
    setFlashcards((prev) => [...data, ...prev]);
    setPreviewCards([]);

    // Refresh quota after successful save
    loadQuota();
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-73px)]" data-testid="dashboard-content">
      {/* Sidebar - Deck List */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b">
          <h2 className="font-semibold text-sm">Your Decks</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <DeckList
            decks={decks}
            selectedDeckId={selectedDeck?.id ?? null}
            onSelectDeck={handleSelectDeck}
            onEditDeck={handleEditDeck}
            onDeleteDeck={handleDeleteDeck}
            loading={decksLoading}
          />
        </div>
        <DeckForm onSubmit={handleCreateDeck} />
        {/* AI Generation Quota */}
        {quota && (
          <div className="p-3 border-t" data-testid="sidebar-quota">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Generations</span>
              <span
                className={`font-medium ${
                  quota.remaining <= 0
                    ? "text-destructive"
                    : quota.remaining <= 5
                      ? "text-yellow-600"
                      : "text-foreground"
                }`}
              >
                {quota.remaining}/{quota.limit}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  quota.remaining <= 0 ? "bg-destructive" : quota.remaining <= 5 ? "bg-yellow-500" : "bg-primary"
                }`}
                style={{ width: `${(quota.remaining / quota.limit) * 100}%` }}
              />
            </div>
          </div>
        )}
        {/* Mini Stats Widget */}
        <MiniStats accessToken={accessToken} />
      </aside>

      {/* Main Content - Flashcards */}
      <main className="flex-1 overflow-auto p-6">
        {selectedDeck ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedDeck.name}</h2>
                {selectedDeck.description && <p className="text-muted-foreground mt-1">{selectedDeck.description}</p>}
              </div>
              <div className="flex gap-2">
                {dueCardsCount > 0 && (
                  <Button
                    variant="default"
                    onClick={() => (window.location.href = `/study/${selectedDeck.id}?due=true`)}
                    data-testid="review-due-button"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Review Due ({dueCardsCount})
                  </Button>
                )}
                <Button
                  variant={dueCardsCount > 0 ? "outline" : "default"}
                  onClick={() => (window.location.href = `/study/${selectedDeck.id}`)}
                  disabled={flashcards.length === 0}
                  data-testid="study-deck-button"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study All ({flashcards.length})
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <FlashcardForm onSubmit={handleCreateFlashcard} />
              <AIGenerateForm onGenerate={handleGenerateFlashcards} quota={quota} />
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Flashcards ({flashcards.length})</h3>
              <FlashcardList
                flashcards={flashcards}
                onEditFlashcard={handleEditFlashcard}
                onDeleteFlashcard={handleDeleteFlashcard}
                loading={flashcardsLoading}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center" data-testid="no-deck-selected">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Select a deck to view flashcards</p>
              <p className="text-sm">Or create a new deck using the form in the sidebar</p>
            </div>
          </div>
        )}
      </main>

      <AIPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        flashcards={previewCards}
        onSave={handleSavePreviewCards}
      />
    </div>
  );
}
