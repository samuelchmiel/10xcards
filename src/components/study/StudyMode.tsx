import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shuffle, X, RotateCcw } from "lucide-react";

interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
}

interface StudyModeProps {
  deckName: string;
  flashcards: StudyFlashcard[];
  accessToken: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudyMode({ deckName, flashcards: initialFlashcards }: StudyModeProps) {
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const hasCards = totalCards > 0;

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

  const handleExit = useCallback(() => {
    window.location.assign("/dashboard");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight" || e.key === "n") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "p") {
        handlePrevious();
      } else if (e.key === "Escape") {
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, handleExit]);

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
        </div>

        {/* Keyboard Shortcuts Help */}
        <p className="text-xs text-muted-foreground mt-6">
          Keyboard: Space/Enter to flip, Arrow keys to navigate, Esc to exit
        </p>
      </main>
    </div>
  );
}
