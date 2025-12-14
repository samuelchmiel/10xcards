import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AIGenerateFormProps {
  onGenerate: (text: string, count: number) => Promise<void>;
}

export function AIGenerateForm({ onGenerate }: AIGenerateFormProps) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }
    if (text.trim().length < 10) {
      setError("Text must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onGenerate(text.trim(), count);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCount(Math.min(20, Math.max(1, value)));
    }
  };

  return (
    <Card data-testid="ai-generate-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">✨</span>
          AI Generate Flashcards
        </CardTitle>
        <CardDescription>Paste text and let AI create flashcards automatically</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generate-text">Source Text</Label>
            <Textarea
              id="generate-text"
              placeholder="Paste your notes, article, or any text you want to learn from..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
              className="resize-none h-32"
              data-testid="generate-text-input"
            />
            <p className="text-xs text-muted-foreground">{text.length}/10000 characters</p>
          </div>

          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="generate-count">Number of flashcards</Label>
              <Input
                id="generate-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={handleCountChange}
                disabled={loading}
                className="w-24"
                data-testid="generate-count-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !text.trim() || text.trim().length < 10}
              data-testid="generate-flashcards-button"
            >
              {loading ? "Generating..." : "Generate Flashcards"}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="generate-error">
              {error}
            </p>
          )}

          {loading && (
            <p className="text-sm text-muted-foreground">
              AI is analyzing your text and creating flashcards. This may take a moment...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
