import { useState } from "react";
import type { Deck } from "@/db/database.types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeckListProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onSelectDeck: (deck: Deck) => void;
  onDeleteDeck: (id: string) => Promise<void>;
  loading: boolean;
}

export function DeckList({ decks, selectedDeckId, onSelectDeck, onDeleteDeck, loading }: DeckListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, deck: Deck) => {
    e.stopPropagation();
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deckToDelete) return;
    setDeleting(true);
    try {
      await onDeleteDeck(deckToDelete.id);
      setDeleteDialogOpen(false);
      setDeckToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 p-2" data-testid="deck-list-loading">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground" data-testid="deck-list-empty">
        No decks yet. Create your first deck!
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full" data-testid="deck-list">
        <div className="space-y-1 p-2">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors ${
                selectedDeckId === deck.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => onSelectDeck(deck)}
              data-testid={`deck-item-${deck.id}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{deck.name}</p>
                {deck.description && (
                  <p
                    className={`text-xs truncate ${
                      selectedDeckId === deck.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {deck.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                  selectedDeckId === deck.id
                    ? "hover:bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-destructive hover:text-destructive-foreground"
                }`}
                onClick={(e) => handleDeleteClick(e, deck)}
                data-testid={`delete-deck-button-${deck.id}`}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deckToDelete?.name}"? This will also delete all flashcards in this deck.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              data-testid="cancel-delete-deck"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
              data-testid="confirm-delete-deck"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
