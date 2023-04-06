import { WorkoutType } from "@prisma/client";

export enum WorkoutTypeClient {
  WEIGHTLIFTING = "Weightlifting",
  COMBAT_SPORTS = "Combat Sports",
  WATER_SPORTS = "Water Sports",
  WINTER_SPORTS = "Winter Sports",
  CARDIO = "Cardio",
  OTHER = "Other",
}

export const workoutTypePrismaToClientMapper = (
  workoutType: WorkoutType
): WorkoutTypeClient => {
  switch (workoutType) {
    case WorkoutType.WEIGHTLIFTING:
      return WorkoutTypeClient.WEIGHTLIFTING;
    case WorkoutType.COMBAT_SPORTS:
      return WorkoutTypeClient.COMBAT_SPORTS;
    case WorkoutType.WATER_SPORTS:
      return WorkoutTypeClient.WATER_SPORTS;
    case WorkoutType.WINTER_SPORTS:
      return WorkoutTypeClient.WINTER_SPORTS;
    case WorkoutType.CARDIO:
      return WorkoutTypeClient.CARDIO;
    case WorkoutType.OTHER:
      return WorkoutTypeClient.OTHER;
  }
};

export const workoutTypeClientToPrismaMapper = (
  workoutType: WorkoutTypeClient
): WorkoutType => {
  switch (workoutType) {
    case WorkoutTypeClient.WEIGHTLIFTING:
      return WorkoutType.WEIGHTLIFTING;
    case WorkoutTypeClient.COMBAT_SPORTS:
      return WorkoutType.COMBAT_SPORTS;
    case WorkoutTypeClient.WATER_SPORTS:
      return WorkoutType.WATER_SPORTS;
    case WorkoutTypeClient.WINTER_SPORTS:
      return WorkoutType.WINTER_SPORTS;
    case WorkoutTypeClient.CARDIO:
      return WorkoutType.CARDIO;
    case WorkoutTypeClient.OTHER:
      return WorkoutType.OTHER;
  }
};
