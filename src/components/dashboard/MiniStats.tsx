import { useState, useEffect } from "react";
import { Flame, Target, BookOpen, ChevronRight } from "lucide-react";
import type { UserStats } from "@/db/database.types";

interface MiniStatsProps {
  accessToken: string;
}

export function MiniStats({ accessToken }: MiniStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const { data } = await response.json();
          setStats(data.userStats);
        }
      } catch {
        // Silently handle stats loading errors
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="p-3 border-t" data-testid="mini-stats-loading">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="border-t" data-testid="mini-stats">
      <a href="/stats" className="block p-3 hover:bg-muted/50 transition-colors group" data-testid="mini-stats-link">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Your Stats</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <div className="text-lg font-bold leading-none">{stats.studyStreak}</div>
            <div className="text-[10px] text-muted-foreground">Streak</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-bold leading-none">{stats.reviewsToday}</div>
            <div className="text-[10px] text-muted-foreground">Today</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Target className="h-3.5 w-3.5 text-green-500" />
            </div>
            <div className="text-lg font-bold leading-none">{stats.averageAccuracy.toFixed(0)}%</div>
            <div className="text-[10px] text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </a>
    </div>
  );
}
