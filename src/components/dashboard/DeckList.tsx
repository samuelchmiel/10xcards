import { useState } from "react";
import type { Deck } from "@/db/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  onEditDeck: (id: string, name: string, description: string) => Promise<void>;
  onDeleteDeck: (id: string) => Promise<void>;
  loading: boolean;
}

export function DeckList({ decks, selectedDeckId, onSelectDeck, onEditDeck, onDeleteDeck, loading }: DeckListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleEditClick = (e: React.MouseEvent, deck: Deck) => {
    e.stopPropagation();
    setDeckToEdit(deck);
    setEditName(deck.name);
    setEditDescription(deck.description || "");
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!deckToEdit) return;
    if (!editName.trim()) {
      setEditError("Deck name is required");
      return;
    }
    setEditing(true);
    setEditError(null);
    try {
      await onEditDeck(deckToEdit.id, editName.trim(), editDescription.trim());
      setEditDialogOpen(false);
      setDeckToEdit(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update deck");
    } finally {
      setEditing(false);
    }
  };

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
              role="button"
              tabIndex={0}
              className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors ${
                selectedDeckId === deck.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => onSelectDeck(deck)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDeck(deck);
                }
              }}
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
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className={selectedDeckId === deck.id ? "hover:bg-primary-foreground/20 text-primary-foreground" : ""}
                  onClick={(e) => handleEditClick(e, deck)}
                  data-testid={`edit-deck-button-${deck.id}`}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    selectedDeckId === deck.id
                      ? "hover:bg-primary-foreground/20 text-primary-foreground"
                      : "hover:bg-destructive hover:text-destructive-foreground"
                  }
                  onClick={(e) => handleDeleteClick(e, deck)}
                  data-testid={`delete-deck-button-${deck.id}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deckToDelete?.name}&quot;? This will also delete all flashcards in
              this deck. This action cannot be undone.
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>Make changes to your deck below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-deck-name">Name</Label>
              <Input
                id="edit-deck-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Deck name..."
                data-testid="edit-deck-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deck-description">Description (optional)</Label>
              <Textarea
                id="edit-deck-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Deck description..."
                rows={3}
                data-testid="edit-deck-description"
              />
            </div>
            {editError && (
              <p className="text-sm text-destructive" data-testid="edit-deck-error">
                {editError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editing}
              data-testid="cancel-edit-deck"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit} disabled={editing} data-testid="confirm-edit-deck">
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
