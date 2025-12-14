import { useState, useEffect, useCallback } from "react";
import type { Deck, Flashcard } from "@/db/database.types";
import { DeckList } from "./DeckList";
import { DeckForm } from "./DeckForm";
import { FlashcardList } from "./FlashcardList";
import { FlashcardForm } from "./FlashcardForm";
import { AIGenerateForm } from "./AIGenerateForm";
import { Separator } from "@/components/ui/separator";

interface DashboardProps {
  accessToken: string;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);

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

  const loadDecks = useCallback(async () => {
    setDecksLoading(true);
    try {
      const response = await fetchWithAuth("/api/decks");
      if (response.ok) {
        const { data } = await response.json();
        setDecks(data || []);
      }
    } catch (error) {
      console.error("Failed to load decks:", error);
    } finally {
      setDecksLoading(false);
    }
  }, [fetchWithAuth]);

  const loadFlashcards = useCallback(
    async (deckId: string) => {
      setFlashcardsLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/flashcards?deck_id=${deckId}`
        );
        if (response.ok) {
          const { data } = await response.json();
          setFlashcards(data || []);
        }
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      } finally {
        setFlashcardsLoading(false);
      }
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck.id);
    } else {
      setFlashcards([]);
    }
  }, [selectedDeck, loadFlashcards]);

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

  const handleGenerateFlashcards = async (text: string, count: number) => {
    if (!selectedDeck) return;

    const response = await fetchWithAuth("/api/generate-flashcards", {
      method: "POST",
      body: JSON.stringify({ text, deck_id: selectedDeck.id, count }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to generate flashcards");
    }

    const { data } = await response.json();
    setFlashcards((prev) => [...data, ...prev]);
  };

  return (
    <div
      className="flex flex-col md:flex-row h-[calc(100vh-73px)]"
      data-testid="dashboard-content"
    >
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
            onDeleteDeck={handleDeleteDeck}
            loading={decksLoading}
          />
        </div>
        <DeckForm onSubmit={handleCreateDeck} />
      </aside>

      {/* Main Content - Flashcards */}
      <main className="flex-1 overflow-auto p-6">
        {selectedDeck ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedDeck.name}</h2>
              {selectedDeck.description && (
                <p className="text-muted-foreground mt-1">
                  {selectedDeck.description}
                </p>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <FlashcardForm
                deckId={selectedDeck.id}
                onSubmit={handleCreateFlashcard}
              />
              <AIGenerateForm
                deckId={selectedDeck.id}
                onGenerate={handleGenerateFlashcards}
              />
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">
                Flashcards ({flashcards.length})
              </h3>
              <FlashcardList
                flashcards={flashcards}
                onDeleteFlashcard={handleDeleteFlashcard}
                loading={flashcardsLoading}
              />
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center h-full text-center"
            data-testid="no-deck-selected"
          >
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Select a deck to view flashcards</p>
              <p className="text-sm">
                Or create a new deck using the form in the sidebar
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
