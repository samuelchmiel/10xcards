import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewFlashcard {
  id: string;
  front: string;
  back: string;
}

interface AIPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcards: PreviewFlashcard[];
  onSave: (flashcards: { front: string; back: string }[]) => Promise<void>;
}

export function AIPreviewDialog({ open, onOpenChange, flashcards, onSave }: AIPreviewDialogProps) {
  const [cards, setCards] = useState<(PreviewFlashcard & { selected: boolean })[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when flashcards prop changes (new generation)
  useEffect(() => {
    setCards(flashcards.map((fc) => ({ ...fc, selected: true })));
    setError(null);
  }, [flashcards]);

  const handleToggleSelect = (id: string) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, selected: !card.selected } : card)));
  };

  const handleToggleAll = () => {
    const allSelected = cards.every((c) => c.selected);
    setCards((prev) => prev.map((card) => ({ ...card, selected: !allSelected })));
  };

  const handleEditFront = (id: string, front: string) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, front } : card)));
  };

  const handleEditBack = (id: string, back: string) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, back } : card)));
  };

  const handleSave = async () => {
    const selectedCards = cards.filter((c) => c.selected && c.front.trim() && c.back.trim());
    if (selectedCards.length === 0) {
      setError("Please select at least one flashcard with valid content");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(selectedCards.map((c) => ({ front: c.front.trim(), back: c.back.trim() })));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flashcards");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = cards.filter((c) => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Generated Flashcards</DialogTitle>
          <DialogDescription>
            Review and edit the AI-generated flashcards below. Select the ones you want to save.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-b">
          <Button variant="ghost" size="sm" onClick={handleToggleAll} data-testid="toggle-all-cards">
            {cards.every((c) => c.selected) ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {cards.length} selected
          </span>
        </div>

        <div className="overflow-y-auto max-h-[50vh] pr-2" data-testid="preview-cards-list">
          <div className="space-y-4 py-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-lg p-4 transition-colors ${
                  card.selected ? "border-primary bg-primary/5" : "border-muted opacity-60"
                }`}
                data-testid={`preview-card-${card.id}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={card.selected}
                    onCheckedChange={() => handleToggleSelect(card.id)}
                    data-testid={`preview-card-checkbox-${card.id}`}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Front</p>
                      <Textarea
                        value={card.front}
                        onChange={(e) => handleEditFront(card.id, e.target.value)}
                        disabled={!card.selected}
                        rows={2}
                        className="resize-none"
                        data-testid={`preview-card-front-${card.id}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Back</p>
                      <Textarea
                        value={card.back}
                        onChange={(e) => handleEditBack(card.id, e.target.value)}
                        disabled={!card.selected}
                        rows={2}
                        className="resize-none"
                        data-testid={`preview-card-back-${card.id}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" data-testid="preview-error">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} data-testid="preview-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedCount === 0} data-testid="preview-save">
            {saving ? "Saving..." : `Save ${selectedCount} Card${selectedCount !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
