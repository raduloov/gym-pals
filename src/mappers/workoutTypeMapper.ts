import { WorkoutType } from "@prisma/client";

export enum Workout {
  WEIGHTLIFTING = "Weightlifting",
  COMBAT_SPORTS = "Combat Sports",
  WATER_SPORTS = "Water Sports",
  WINTER_SPORTS = "Winter Sports",
  CARDIO = "Cardio",
  OTHER = "Other",
}

export const workoutTypeMapper = (workoutType: WorkoutType): Workout => {
  switch (workoutType) {
    case WorkoutType.WEIGHTLIFTING:
      return Workout.WEIGHTLIFTING;
    case WorkoutType.COMBAT_SPORTS:
      return Workout.COMBAT_SPORTS;
    case WorkoutType.WATER_SPORTS:
      return Workout.WATER_SPORTS;
    case WorkoutType.WINTER_SPORTS:
      return Workout.WINTER_SPORTS;
    case WorkoutType.CARDIO:
      return Workout.CARDIO;
    case WorkoutType.OTHER:
      return Workout.OTHER;
  }
};
