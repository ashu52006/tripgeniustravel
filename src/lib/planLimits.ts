export interface PlanConfig {
  id: string;
  maxDays: number;
  savedTripsLimit: number; // -1 = unlimited
}

/** Soft limits per tier. Feature access itself lives in entitlements.ts. */
export const planConfigs: Record<string, PlanConfig> = {
  free: { id: 'free', maxDays: 15, savedTripsLimit: 3 },
  pro: { id: 'pro', maxDays: 45, savedTripsLimit: -1 },
  premium: { id: 'premium', maxDays: 90, savedTripsLimit: -1 },
  enterprise: { id: 'enterprise', maxDays: 365, savedTripsLimit: -1 },
};

export const getPlanConfig = (planId: string): PlanConfig => planConfigs[planId] || planConfigs.free;
