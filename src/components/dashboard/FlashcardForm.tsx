import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlashcardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
}

export function FlashcardForm({ onSubmit }: FlashcardFormProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      setError("Both front and back are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(front.trim(), back.trim());
      setFront("");
      setBack("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flashcard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card data-testid="create-flashcard-form">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Flashcard</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flashcard-front">Front</Label>
              <Textarea
                id="flashcard-front"
                placeholder="Question or term"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={loading}
                className="resize-none h-24"
                data-testid="flashcard-front-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flashcard-back">Back</Label>
              <Textarea
                id="flashcard-back"
                placeholder="Answer or definition"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={loading}
                className="resize-none h-24"
                data-testid="flashcard-back-input"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" data-testid="flashcard-form-error">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !front.trim() || !back.trim()}
            data-testid="create-flashcard-button"
          >
            {loading ? "Adding..." : "Add Flashcard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
