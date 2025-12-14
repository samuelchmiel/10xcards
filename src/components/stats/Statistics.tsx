import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Flame, Clock, TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { UserStats, DeckStats, ReviewsByDay } from "@/db/database.types";

interface StatisticsProps {
  accessToken: string;
}

export function Statistics({ accessToken }: StatisticsProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [reviewsByDay, setReviewsByDay] = useState<ReviewsByDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const { data } = await response.json();
      setUserStats(data.userStats);
      setDeckStats(data.deckStats);
      setReviewsByDay(data.reviewsByDay);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="stats-loading">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" data-testid="stats-error">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchStats}>Retry</Button>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="stats-no-data">
        <p className="text-muted-foreground">No statistics available yet. Start studying to see your progress!</p>
      </div>
    );
  }

  // Get max count for chart scaling
  const maxDailyReviews = Math.max(...reviewsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8" data-testid="statistics">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress and study habits</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="key-metrics">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.studyStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalCardsReviewed}</div>
            <p className="text-xs text-muted-foreground">{userStats.reviewsToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {userStats.totalCorrect} correct / {userStats.totalIncorrect} incorrect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Studied</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.totalTimeStudied >= 60
                ? `${Math.floor(userStats.totalTimeStudied / 60)}h ${userStats.totalTimeStudied % 60}m`
                : `${userStats.totalTimeStudied}m`}
            </div>
            <p className="text-xs text-muted-foreground">{userStats.totalSessions} sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity chart */}
      <Card data-testid="activity-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reviews (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsByDay.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No review activity yet</p>
          ) : (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="flex items-end gap-1 h-32">
                {getLast30Days().map((date) => {
                  const dayData = reviewsByDay.find((d) => d.date === date);
                  const count = dayData?.count || 0;
                  const height = count > 0 ? Math.max((count / maxDailyReviews) * 100, 4) : 0;
                  const isToday = date === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${date}: ${count} reviews`}
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          count > 0 ? (isToday ? "bg-primary" : "bg-primary/70") : "bg-muted"
                        }`}
                        style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "2px" }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* X-axis labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
              {/* Summary */}
              <div className="flex justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{reviewsByDay.reduce((sum, d) => sum + d.correct, 0)} correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{reviewsByDay.reduce((sum, d) => sum + d.incorrect, 0)} incorrect</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deck statistics */}
      <Card data-testid="deck-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deck Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deckStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No decks yet</p>
          ) : (
            <div className="space-y-4">
              {deckStats.map((deck) => (
                <div key={deck.deckId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{deck.deckName}</span>
                    <span className="text-sm text-muted-foreground">{deck.totalCards} cards</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    {deck.totalCards > 0 && (
                      <>
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${(deck.cardsMastered / deck.totalCards) * 100}%` }}
                          title={`${deck.cardsMastered} mastered`}
                        />
                        <div
                          className="bg-yellow-500 transition-all"
                          style={{ width: `${(deck.cardsLearning / deck.totalCards) * 100}%` }}
                          title={`${deck.cardsLearning} learning`}
                        />
                      </>
                    )}
                  </div>
                  {/* Labels */}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Mastered: {deck.cardsMastered}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Learning: {deck.cardsLearning}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{deck.cardsDue} due</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly summary */}
      <Card data-testid="weekly-summary">
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{userStats.reviewsThisWeek}</p>
              <p className="text-sm text-muted-foreground">Cards reviewed</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{userStats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Study sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get array of last 30 days as ISO date strings
function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days;
}
