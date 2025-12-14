import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserQuotaInfo } from "@/db/database.types";

interface AIGenerateFormProps {
  onGenerate: (text: string, count: number) => Promise<void>;
  quota: UserQuotaInfo | null;
}

export function AIGenerateForm({ onGenerate, quota }: AIGenerateFormProps) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLimitReached = quota !== null && quota.remaining <= 0;
  const maxAllowed = quota ? Math.min(20, quota.remaining) : 20;

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
      setCount(Math.min(maxAllowed, Math.max(1, value)));
    }
  };

  return (
    <Card data-testid="ai-generate-section">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">✨</span>
            AI Generate Flashcards
          </CardTitle>
          {quota && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                quota.remaining <= 10
                  ? quota.remaining <= 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-yellow-500/10 text-yellow-600"
                  : "bg-primary/10 text-primary"
              }`}
              data-testid="quota-badge"
            >
              {quota.remaining}/{quota.limit} remaining
            </span>
          )}
        </div>
        <CardDescription>
          {isLimitReached
            ? "You have reached your AI generation limit"
            : "Paste text and let AI create flashcards automatically"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generate-text">Source Text</Label>
            <Textarea
              id="generate-text"
              placeholder={
                isLimitReached
                  ? "AI generation limit reached"
                  : "Paste your notes, article, or any text you want to learn from..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading || isLimitReached}
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
                max={maxAllowed}
                value={count}
                onChange={handleCountChange}
                disabled={loading || isLimitReached}
                className="w-24"
                data-testid="generate-count-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || isLimitReached || !text.trim() || text.trim().length < 10}
              data-testid="generate-flashcards-button"
            >
              {loading ? "Generating..." : isLimitReached ? "Limit Reached" : "Generate Flashcards"}
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
