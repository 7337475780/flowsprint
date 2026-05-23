interface CacheEntry {
  value: any;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Get value from cache if it exists and hasn't expired.
   */
  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with a TTL (defaults to 5 minutes).
   */
  set(key: string, value: any, ttlMs: number = 300_000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. user specific keys)
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export const analyticsCache = new MemoryCache();

/**
 * Normalizes metrics to evaluate individual or team productivity score (0 - 100).
 * completionRate (40%), sprintVelocity (45%), overdueRatio (-15%).
 */
export const calculateProductivityScore = (
  completedTasks: number,
  totalTasks: number,
  completedPoints: number,
  plannedPoints: number,
  overdueTasks: number
): number => {
  if (totalTasks === 0 && plannedPoints === 0) return 80; // Healthy standard default

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 80;
  const sprintVelocity = plannedPoints > 0 ? (completedPoints / plannedPoints) * 100 : 85;
  const overdueRatio = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

  const score = (completionRate * 0.4) + (sprintVelocity * 0.45) - (overdueRatio * 15);
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Calculates work loading density factor.
 * Active assignments (x3 weighting) + overdue deadlines (x5 weighting).
 */
export const calculateWorkloadIndex = (
  assignedTasks: number,
  completedTasks: number,
  overdueTasks: number
): number => {
  const activeTasks = Math.max(0, assignedTasks - completedTasks);
  return (activeTasks * 3) + (overdueTasks * 5);
};
