import { useState, useEffect, useCallback } from "react";
import type { UserQuotaInfo } from "@/db/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfilePageProps {
  accessToken: string;
  userEmail: string;
}

export function ProfilePage({ accessToken, userEmail }: ProfilePageProps) {
  const [quota, setQuota] = useState<UserQuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    try {
      const response = await fetch("/api/user/quota", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const { data } = await response.json();
        setQuota(data);
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const usagePercentage = quota ? ((quota.limit - quota.remaining) / quota.limit) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground" data-testid="profile-email">
                  {userEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Generation Quota */}
        <Card>
          <CardHeader>
            <CardTitle>AI Generation Quota</CardTitle>
            <CardDescription>Your lifetime AI-generated flashcard allowance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ) : quota ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold" data-testid="quota-used">
                      {quota.count}
                    </p>
                    <p className="text-sm text-muted-foreground">flashcards generated</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-semibold ${
                        quota.remaining <= 0
                          ? "text-destructive"
                          : quota.remaining <= 5
                            ? "text-yellow-600"
                            : "text-primary"
                      }`}
                      data-testid="quota-remaining"
                    >
                      {quota.remaining}
                    </p>
                    <p className="text-sm text-muted-foreground">remaining</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="font-medium">
                      {quota.count} / {quota.limit}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        quota.remaining <= 0 ? "bg-destructive" : quota.remaining <= 5 ? "bg-yellow-500" : "bg-primary"
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                      data-testid="quota-progress"
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {quota.remaining > 0 ? (
                    <>
                      You can generate <strong>{quota.remaining}</strong> more AI flashcards. This is a lifetime limit
                      and does not reset.
                    </>
                  ) : (
                    <span className="text-destructive">
                      You have reached your AI generation limit. You can still create flashcards manually.
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Unable to load quota information.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
