import { useState } from "react";
import type { Flashcard } from "@/db/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FlashcardListProps {
  flashcards: Flashcard[];
  onDeleteFlashcard: (id: string) => Promise<void>;
  loading: boolean;
}

export function FlashcardList({
  flashcards,
  onDeleteFlashcard,
  loading,
}: FlashcardListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (card: Flashcard) => {
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    setDeleting(true);
    try {
      await onDeleteFlashcard(cardToDelete.id);
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="flashcard-list-loading"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-testid="flashcard-list-empty"
      >
        <p className="text-lg mb-2">No flashcards yet</p>
        <p className="text-sm">Add your first flashcard using the form above</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="flashcard-list"
      >
        {flashcards.map((card) => (
          <Card
            key={card.id}
            className="group relative"
            data-testid={`flashcard-item-${card.id}`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Front
                  </p>
                  <p className="text-sm line-clamp-2">{card.front}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Back
                  </p>
                  <p className="text-sm line-clamp-2">{card.back}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleDeleteClick(card)}
                data-testid={`delete-flashcard-button-${card.id}`}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flashcard</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flashcard? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium">Front:</p>
            <p className="text-muted-foreground mb-2">{cardToDelete?.front}</p>
            <p className="font-medium">Back:</p>
            <p className="text-muted-foreground">{cardToDelete?.back}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              data-testid="cancel-delete-flashcard"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
              data-testid="confirm-delete-flashcard"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
