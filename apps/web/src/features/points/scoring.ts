export type PlacementRule = { place: number; points: number };

export type ScoringConfig = {
  killPointValue: number;
  placementRules: PlacementRule[];
};

export type TeamResult = {
  id: string;
  teamName: string;
  kills: number;
  placement: number;
  matchName: string;
};

export type ScoredResult = TeamResult & {
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
};

export const DEFAULT_SCORING: ScoringConfig = {
  killPointValue: 1,
  placementRules: [
    { place: 1, points: 12 }, { place: 2, points: 9 },
    { place: 3, points: 8 }, { place: 4, points: 7 },
    { place: 5, points: 6 }, { place: 6, points: 5 },
    { place: 7, points: 4 }, { place: 8, points: 3 },
    { place: 9, points: 2 }, { place: 10, points: 1 }
  ]
};

export function scoreResult(result: TeamResult, config: ScoringConfig): ScoredResult {
  const placementPoints = config.placementRules.find(rule => rule.place === result.placement)?.points ?? 0;
  const killPoints = Math.max(0, Math.floor(result.kills)) * Math.max(0, config.killPointValue);
  return { ...result, placementPoints, killPoints, totalPoints: placementPoints + killPoints };
}

export function calculateLeaderboard(results: TeamResult[], config: ScoringConfig): ScoredResult[] {
  const totals = new Map<string, ScoredResult>();
  for (const result of results) {
    const scored = scoreResult(result, config);
    const key = result.teamName.trim().toLocaleLowerCase();
    const existing = totals.get(key);
    if (existing) {
      existing.kills += scored.kills;
      existing.placementPoints += scored.placementPoints;
      existing.killPoints += scored.killPoints;
      existing.totalPoints += scored.totalPoints;
    } else {
      totals.set(key, { ...scored });
    }
  }
  return [...totals.values()].sort((a, b) =>
    b.totalPoints - a.totalPoints || b.kills - a.kills || a.placement - b.placement
  );
}
