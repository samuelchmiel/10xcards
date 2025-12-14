import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shuffle, X, RotateCcw } from "lucide-react";
import { RATING_OPTIONS } from "@/lib/services/spaced-repetition";
import type { ReviewRating } from "@/db/database.types";

interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
  easiness_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_date?: string | null;
}

interface StudyModeProps {
  deckId: string;
  deckName: string;
  flashcards: StudyFlashcard[];
  accessToken: string;
  spacedRepetitionMode?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudyMode({
  deckId,
  deckName,
  flashcards: initialFlashcards,
  accessToken,
  spacedRepetitionMode = true,
}: StudyModeProps) {
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const cardStartTime = useRef<number>(Date.now());

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const hasCards = totalCards > 0;

  // Start study session on mount
  useEffect(() => {
    if (!hasCards) return;

    const startSession = async () => {
      try {
        const response = await fetch("/api/study-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ deck_id: deckId }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.data.id);
        }
      } catch {
        // Session tracking is optional, continue without it
      }
    };

    startSession();
  }, [deckId, accessToken, hasCards]);

  // Reset card timer when changing cards
  useEffect(() => {
    cardStartTime.current = Date.now();
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    setFlashcards(shuffleArray(initialFlashcards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  }, [initialFlashcards]);

  const handleReset = useCallback(() => {
    setFlashcards(initialFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  }, [initialFlashcards]);

  const handleExit = useCallback(async () => {
    // End the study session with final stats
    if (sessionId) {
      try {
        await fetch(`/api/study-sessions/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ended_at: new Date().toISOString(),
            cards_studied: reviewedCount,
            cards_correct: correctCount,
            cards_incorrect: incorrectCount,
          }),
        });
      } catch {
        // Session update is optional
      }
    }
    window.location.assign("/dashboard");
  }, [sessionId, accessToken, reviewedCount, correctCount, incorrectCount]);

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard || isSubmittingReview) return;

      setIsSubmittingReview(true);
      try {
        // Calculate time to answer
        const timeToAnswer = Date.now() - cardStartTime.current;

        const response = await fetch(`/api/flashcards/${currentCard.id}/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            rating,
            session_id: sessionId,
            time_to_answer: timeToAnswer,
          }),
        });

        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error("Failed to submit review");
        }

        setReviewedCount((prev) => prev + 1);

        // Track correct/incorrect
        if (rating >= 3) {
          setCorrectCount((prev) => prev + 1);
        } else {
          setIncorrectCount((prev) => prev + 1);
        }

        // Move to next card or finish
        if (currentIndex < totalCards - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        } else {
          // All cards reviewed - show completion or exit
          handleExit();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error submitting review:", error);
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [currentCard, currentIndex, totalCards, accessToken, isSubmittingReview, handleExit, sessionId]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight" || e.key === "n") {
        if (!spacedRepetitionMode || !isFlipped) {
          handleNext();
        }
      } else if (e.key === "ArrowLeft" || e.key === "p") {
        handlePrevious();
      } else if (e.key === "Escape") {
        handleExit();
      } else if (spacedRepetitionMode && isFlipped) {
        // Rating shortcuts when card is flipped (1=Again, 2=Hard, 3=Good, 4=Easy)
        if (e.key === "1") handleRate(1);
        else if (e.key === "2") handleRate(3);
        else if (e.key === "3") handleRate(4);
        else if (e.key === "4") handleRate(5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, handleExit, handleRate, spacedRepetitionMode, isFlipped]);

  if (!hasCards) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="study-mode">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleExit} data-testid="study-exit-button">
              <X className="h-4 w-4 mr-2" />
              Exit Study
            </Button>
            <h1 className="text-lg font-semibold">{deckName}</h1>
            <div className="w-24" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground" data-testid="no-cards-message">
            <p className="text-lg mb-2">No flashcards in this deck</p>
            <p className="text-sm">Add some flashcards to start studying</p>
            <Button onClick={handleExit} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="study-mode">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleExit} data-testid="study-exit-button">
            <X className="h-4 w-4 mr-2" />
            Exit Study
          </Button>
          <h1 className="text-lg font-semibold">{deckName}</h1>
          <span className="text-sm text-muted-foreground" data-testid="card-counter">
            Card {currentIndex + 1}/{totalCards}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Flip Card */}
        <div className="w-full max-w-2xl perspective-1000">
          <div
            role="button"
            tabIndex={0}
            className={`relative cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={handleFlip}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFlip();
              }
            }}
            data-testid="flashcard"
            aria-label={isFlipped ? "Click to show question" : "Click to show answer"}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <Card
              className="min-h-[300px] md:min-h-[400px] flex items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
              data-testid="flashcard-front"
            >
              <CardContent className="p-8 text-center">
                <p className="text-xl md:text-2xl font-medium">{currentCard.front}</p>
                <p className="text-sm text-muted-foreground mt-6">Tap to flip</p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card
              className="min-h-[300px] md:min-h-[400px] flex items-center justify-center absolute inset-0 backface-hidden rotate-y-180 bg-primary/5"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              data-testid="flashcard-back"
            >
              <CardContent className="p-8 text-center">
                <p className="text-xl md:text-2xl">{currentCard.back}</p>
                <p className="text-sm text-muted-foreground mt-6">Tap to flip back</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mt-6">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>

        {/* Rating Buttons (shown when flipped in spaced repetition mode) */}
        {spacedRepetitionMode && isFlipped && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6" data-testid="rating-buttons">
            {RATING_OPTIONS.map((option, index) => (
              <Button
                key={option.rating}
                variant={option.color === "destructive" ? "destructive" : "outline"}
                size="lg"
                onClick={() => handleRate(option.rating)}
                disabled={isSubmittingReview}
                className={`min-w-[80px] ${
                  option.color === "warning"
                    ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    : option.color === "success"
                      ? "border-green-500 text-green-600 hover:bg-green-50"
                      : ""
                }`}
                data-testid={`rating-${option.label.toLowerCase()}`}
              >
                <span className="text-xs opacity-60 mr-1">{index + 1}</span>
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            data-testid="previous-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isShuffled ? (
            <Button variant="outline" size="icon" onClick={handleReset} title="Reset order" data-testid="reset-button">
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={handleShuffle}
              title="Shuffle cards"
              data-testid="shuffle-button"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          )}

          {!spacedRepetitionMode || !isFlipped ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              data-testid="next-button"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="w-[100px]" /> // Placeholder to maintain layout
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <p className="text-xs text-muted-foreground mt-6">
          {spacedRepetitionMode && isFlipped
            ? "Keyboard: 1=Again, 2=Hard, 3=Good, 4=Easy, Esc to exit"
            : "Keyboard: Space/Enter to flip, Arrow keys to navigate, Esc to exit"}
        </p>

        {/* Review Progress */}
        {spacedRepetitionMode && reviewedCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Reviewed: {reviewedCount} / {totalCards}
          </p>
        )}
      </main>
    </div>
  );
}
