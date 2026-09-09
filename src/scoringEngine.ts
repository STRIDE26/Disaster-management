import { DistressRequest, Building, HazardLevel } from './types';

export interface ScoringWeights {
  waterRising: number;
  fire: number;
  trapped: number;
  childPerPerson: number;
  disabledPerPerson: number;
  injuredPerPerson: number;
  unwellPerPerson: number;
  needRescue: number;
  personBase: number;
  timePer30Min: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  waterRising: 30,
  fire: 30,
  trapped: 20,
  childPerPerson: 20,
  disabledPerPerson: 20,
  injuredPerPerson: 30,
  unwellPerPerson: 30,
  needRescue: 10,
  personBase: 10,
  timePer30Min: 15,
};

export function calculateDistressScore(
  req: {
    situations: DistressRequest['situations'];
    peopleCount: number;
    waitingMinutes: number;
  },
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
) {
  const waterRising = req.situations.waterRising ? weights.waterRising : 0;
  const fire = req.situations.fire ? weights.fire : 0;
  const trapped = req.situations.trapped ? weights.trapped : 0;
  const children = req.situations.childrenCount * weights.childPerPerson;
  const disabled = req.situations.disabledCount * weights.disabledPerPerson;
  const injured = req.situations.heavilyInjuredCount * weights.injuredPerPerson;
  const unwell = req.situations.seriouslyUnwellCount * weights.unwellPerPerson;
  const needRescue = req.situations.needRescue ? weights.needRescue : 0;
  const peopleCount = req.peopleCount * weights.personBase;
  const waitingIntervals = Math.floor(req.waitingMinutes / 30);
  const waitingTime = waitingIntervals * weights.timePer30Min;

  const total =
    waterRising +
    fire +
    trapped +
    children +
    disabled +
    injured +
    unwell +
    needRescue +
    peopleCount +
    waitingTime;

  return {
    total,
    breakdown: {
      waterRising,
      fire,
      trapped,
      children,
      disabled,
      injured,
      unwell,
      needRescue,
      peopleCount,
      waitingTime,
    },
  };
}

export const HAZARD_SCORE_MAP: Record<HazardLevel, number> = {
  SEVERE: 100,
  HIGH: 80,
  MODERATE: 50,
  LOW: 20,
  UNASSESSED: 30,
};

export function calculateBuildingScore(
  distressScore: number,
  unaccountedCount: number,
  hazardZone: HazardLevel,
  weights = { distress: 0.5, unaccounted: 0.3, hazard: 0.2 }
) {
  // Normalize unaccounted count to a score (e.g. 1 unaccounted ~ 15-20 points base)
  const unaccountedScore = unaccountedCount * 25;
  const hazardScore = HAZARD_SCORE_MAP[hazardZone] || 30;

  const finalScore = Math.round(
    weights.distress * distressScore +
      weights.unaccounted * unaccountedScore +
      weights.hazard * hazardScore
  );

  return {
    distressScore,
    unaccountedScore,
    hazardScore,
    finalScore,
  };
}
