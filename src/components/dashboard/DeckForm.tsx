import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeckFormProps {
  onSubmit: (name: string, description: string) => Promise<void>;
}

export function DeckForm({ onSubmit }: DeckFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-3 border-t"
      data-testid="create-deck-form"
    >
      <div className="space-y-1">
        <Label htmlFor="deck-name" className="text-xs">
          New Deck
        </Label>
        <Input
          id="deck-name"
          placeholder="Deck name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          data-testid="deck-name-input"
        />
      </div>
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        className="resize-none h-16"
        data-testid="deck-description-input"
      />
      {error && (
        <p className="text-xs text-destructive" data-testid="deck-form-error">
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        className="w-full"
        disabled={loading || !name.trim()}
        data-testid="create-deck-button"
      >
        {loading ? "Creating..." : "Create Deck"}
      </Button>
    </form>
  );
}
