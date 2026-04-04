export interface PlanConfig {
  id: string;
  maxDays: number;
  canExportPdf: boolean;
  canEmailTrip: boolean;
  savedTripsLimit: number; // -1 = unlimited
  allDaysUnlocked: boolean;
}

export const planConfigs: Record<string, PlanConfig> = {
  basic: {
    id: 'basic',
    maxDays: 15,
    canExportPdf: true,
    canEmailTrip: true,
    savedTripsLimit: -1,
    allDaysUnlocked: true,
  },
  silver: {
    id: 'silver',
    maxDays: 30,
    canExportPdf: true,
    canEmailTrip: true,
    savedTripsLimit: -1,
    allDaysUnlocked: true,
  },
  gold: {
    id: 'gold',
    maxDays: 60,
    canExportPdf: true,
    canEmailTrip: true,
    savedTripsLimit: -1,
    allDaysUnlocked: true,
  },
  platinum: {
    id: 'platinum',
    maxDays: 90,
    canExportPdf: true,
    canEmailTrip: true,
    savedTripsLimit: -1,
    allDaysUnlocked: true,
  },
};

export const getPlanConfig = (planId: string): PlanConfig => {
  return planConfigs[planId] || planConfigs.basic;
};
