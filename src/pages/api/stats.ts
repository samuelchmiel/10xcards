import type { APIRoute } from "astro";
import type { UserStats, DeckStats, ReviewsByDay } from "@/db/database.types";

export const prerender = false;

// GET /api/stats - Get user statistics
export const GET: APIRoute = async ({ locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get study sessions stats
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("started_at, ended_at, cards_studied, cards_correct, cards_incorrect");

    const totalSessions = sessions?.length || 0;
    const totalCardsReviewed = sessions?.reduce((sum, s) => sum + s.cards_studied, 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + s.cards_correct, 0) || 0;
    const totalIncorrect = sessions?.reduce((sum, s) => sum + s.cards_incorrect, 0) || 0;

    // Calculate total time studied (in minutes)
    const totalTimeStudied =
      sessions?.reduce((sum, s) => {
        if (s.ended_at && s.started_at) {
          const duration = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
          return sum + duration / 60000; // Convert to minutes
        }
        return sum;
      }, 0) || 0;

    // Calculate study streak (consecutive days with sessions)
    const studyStreak = calculateStudyStreak(sessions || []);

    // Get reviews for today and this week
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { data: recentReviews } = await supabase
      .from("card_reviews")
      .select("reviewed_at")
      .gte("reviewed_at", weekAgo);

    const reviewsToday = recentReviews?.filter((r) => r.reviewed_at.startsWith(today)).length || 0;
    const reviewsThisWeek = recentReviews?.length || 0;

    const userStats: UserStats = {
      totalSessions,
      totalCardsReviewed,
      totalCorrect,
      totalIncorrect,
      averageAccuracy: totalCardsReviewed > 0 ? (totalCorrect / totalCardsReviewed) * 100 : 0,
      studyStreak,
      totalTimeStudied: Math.round(totalTimeStudied),
      reviewsToday,
      reviewsThisWeek,
    };

    // Get deck stats
    const { data: decks } = await supabase.from("decks").select("id, name");

    const deckStats: DeckStats[] = [];
    for (const deck of decks || []) {
      const { data: flashcards } = await supabase
        .from("flashcards")
        .select("easiness_factor, repetitions, next_review_date")
        .eq("deck_id", deck.id);

      const totalCards = flashcards?.length || 0;
      const todayStr = new Date().toISOString().split("T")[0];
      const cardsDue = flashcards?.filter((f) => !f.next_review_date || f.next_review_date <= todayStr).length || 0;
      const cardsLearning = flashcards?.filter((f) => f.repetitions < 3).length || 0;
      const cardsMastered = flashcards?.filter((f) => f.repetitions >= 3).length || 0;
      const averageEasiness =
        totalCards > 0 && flashcards ? flashcards.reduce((sum, f) => sum + f.easiness_factor, 0) / totalCards : 2.5;

      deckStats.push({
        deckId: deck.id,
        deckName: deck.name,
        totalCards,
        cardsDue,
        cardsLearning,
        cardsMastered,
        averageEasiness: Math.round(averageEasiness * 100) / 100,
      });
    }

    // Get reviews by day for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: reviewsLast30Days } = await supabase
      .from("card_reviews")
      .select("reviewed_at, rating")
      .gte("reviewed_at", thirtyDaysAgo)
      .order("reviewed_at", { ascending: true });

    const reviewsByDay: ReviewsByDay[] = [];
    const dayMap = new Map<string, { count: number; correct: number; incorrect: number }>();

    for (const review of reviewsLast30Days || []) {
      const day = review.reviewed_at.split("T")[0];
      const existing = dayMap.get(day) || { count: 0, correct: 0, incorrect: 0 };
      existing.count++;
      if (review.rating >= 3) {
        existing.correct++;
      } else {
        existing.incorrect++;
      }
      dayMap.set(day, existing);
    }

    for (const [date, stats] of dayMap) {
      reviewsByDay.push({
        date,
        count: stats.count,
        correct: stats.correct,
        incorrect: stats.incorrect,
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          userStats,
          deckStats,
          reviewsByDay,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch statistics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

function calculateStudyStreak(
  sessions: { started_at: string; ended_at: string | null; cards_studied: number }[]
): number {
  if (sessions.length === 0) return 0;

  // Get unique days with study sessions
  const studyDays = new Set<string>();
  for (const session of sessions) {
    if (session.cards_studied > 0) {
      studyDays.add(session.started_at.split("T")[0]);
    }
  }

  if (studyDays.size === 0) return 0;

  // Sort days in descending order
  const sortedDays = Array.from(studyDays).sort((a, b) => b.localeCompare(a));

  // Check if today or yesterday was a study day
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) {
    return 0; // Streak is broken
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDay = new Date(sortedDays[i - 1]);
    const previousDay = new Date(sortedDays[i]);
    const diffDays = (currentDay.getTime() - previousDay.getTime()) / (24 * 60 * 60 * 1000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
