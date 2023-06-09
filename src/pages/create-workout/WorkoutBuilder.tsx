import { WorkoutType } from "@prisma/client";
import { useEffect, useState } from "react";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import { Button } from "@nextui-org/react";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import type { WeightliftingExcercise } from "@prisma/client";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import { CloseSquare } from "react-iconly";
import ExercisesModal from "~/components/ExercisesModal";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";

export interface Exercise {
  name: string;
  sets: Array<{
    weight: string;
    reps: string;
  }>;
}

interface Props {
  isEditing: boolean;
  allExercises: WeightliftingExcercise[];
  selectedExercises: Exercise[];
  setSelectedExercises: (exercises: Exercise[]) => void;
  selectedWorkoutType: WorkoutTypeClient | null;
  setSelectedWorkoutType: (workoutType: WorkoutTypeClient) => void;
  bodyWeight: string;
  setBodyWeight: (bodyWeight: string) => void;
}

const WorkoutBuilder = ({
  isEditing,
  allExercises,
  selectedExercises,
  setSelectedExercises,
  selectedWorkoutType,
  setSelectedWorkoutType,
  bodyWeight,
  setBodyWeight,
}: Props) => {
  const { user } = useUser();
  const [isSelectingExercises, setIsSelectingExercises] = useState(false);
  const [hasAddedBodyWeight, setHasAddedBodyWeight] = useState(false);
  const [currentSelectedExercise, setCurrentSelectedExercise] = useState<
    string | null
  >(null);

  // Populate fields if editing
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    setHasAddedBodyWeight(!!bodyWeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const { data: lastExerciseData } =
    api.workouts.getLastExerciseDataFromWorkoutByUserId.useQuery({
      userId: user?.id ?? "",
      exerciseName: currentSelectedExercise ?? "",
    });

  // Populate exercise with values from the last time the user performed it
  useEffect(() => {
    if (lastExerciseData && currentSelectedExercise) {
      const exercise: Exercise = {
        name: lastExerciseData.name,
        sets: lastExerciseData.sets.map((set) => ({
          weight: set.weight as unknown as string,
          reps: set.reps as unknown as string,
        })),
      };
      const newExercises = [...selectedExercises];
      newExercises[newExercises.length - 1] = exercise;

      setSelectedExercises(newExercises);
      setCurrentSelectedExercise(null);
    }
  }, [
    lastExerciseData,
    currentSelectedExercise,
    selectedExercises,
    setSelectedExercises,
  ]);

  const handleAddSet = (exerciseIndex: number) => {
    const currentExercise = selectedExercises[exerciseIndex];
    if (currentExercise) {
      currentExercise.sets.push({
        weight: "0",
        reps: "0",
      });
      const newExercises = [...selectedExercises];
      newExercises[exerciseIndex] = currentExercise;
      setSelectedExercises(newExercises);
    }
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const currentExercise = selectedExercises[exerciseIndex];
    if (currentExercise && currentExercise.sets.length > 1) {
      currentExercise.sets = currentExercise.sets.filter(
        (_, index) => index !== setIndex
      );
      const newExercises = [...selectedExercises];
      newExercises[exerciseIndex] = currentExercise;
      setSelectedExercises(newExercises);
    }
  };

  const handleInputsChange = (
    set: { weight: string; reps: string },
    exerciseIndex: number,
    setIndex: number
  ) => {
    const currentExercise = selectedExercises[exerciseIndex];

    if (currentExercise) {
      currentExercise.sets[setIndex] = {
        weight: set.weight,
        reps: set.reps,
      };

      const newExercises = [...selectedExercises];
      newExercises[exerciseIndex] = currentExercise;
      setSelectedExercises(newExercises);
    }
  };

  const handleRepsChange = (
    value: string,
    set: { weight: string; reps: string },
    exerciseIndex: number,
    setIndex: number
  ) => {
    set.reps = value.replace(/,/, ".");
    handleInputsChange(set, exerciseIndex, setIndex);
  };

  const handleWeightChange = (
    value: string,
    set: { weight: string; reps: string },
    exerciseIndex: number,
    setIndex: number
  ) => {
    set.weight = value.replace(/,/, ".");
    handleInputsChange(set, exerciseIndex, setIndex);
  };

  const handleAddExercise = (exercise: WeightliftingExcercise) => {
    const selectedExercise: Exercise = {
      name: exercise.title,
      sets: [
        // Add 4 sets by default
        {
          weight: "0",
          reps: "0",
        },
        {
          weight: "0",
          reps: "0",
        },
        {
          weight: "0",
          reps: "0",
        },
        {
          weight: "0",
          reps: "0",
        },
      ],
    };
    setCurrentSelectedExercise(exercise.title);
    setSelectedExercises([...selectedExercises, selectedExercise]);
    setIsSelectingExercises(false);
  };

  const handleRemoveExercise = (exerciseIndex: number) =>
    setSelectedExercises(
      selectedExercises.filter((_, index) => index !== exerciseIndex)
    );

  const handleRemoveBodyWeight = () => {
    setBodyWeight("0");
    setHasAddedBodyWeight(false);
  };

  const renderButtons = (): JSX.Element | null => {
    const shouldRenderButtons =
      selectedWorkoutType &&
      !isSelectingExercises &&
      selectedWorkoutType ===
        workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING);

    if (shouldRenderButtons) {
      return (
        <div className="flex justify-end">
          <div className="flex flex-col gap-1 p-1">
            <Button flat onPress={() => setIsSelectingExercises(true)}>
              + Add exercise
            </Button>
            {!hasAddedBodyWeight && (
              <Button flat onPress={() => setHasAddedBodyWeight(true)}>
                + Add body weight
              </Button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!selectedWorkoutType) {
    return (
      <WorkoutTypesContainer
        onSelect={(workoutType) => setSelectedWorkoutType(workoutType)}
      />
    );
  }

  return (
    <div className="mt-2 w-full">
      <ExercisesModal
        isSelectingExercises={isSelectingExercises}
        setIsSelectingExercises={setIsSelectingExercises}
        allExercises={allExercises}
        handleAddExercise={handleAddExercise}
      />

      <div className="m-4 flex flex-wrap justify-center gap-5">
        {selectedExercises &&
          selectedExercises.map((exercise, exerciseIndex) => (
            <div className="flex items-center" key={exercise.name}>
              <div className="rounded-xl border border-slate-400 p-4 text-xl">
                {`${exerciseIndex + 1}. ${exercise.name}`}
                <div className="my-1 flex flex-col">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      className="my-1 flex items-center gap-1"
                      key={setIndex}
                    >
                      <input
                        type="number"
                        inputMode="decimal"
                        pattern="^[0-9]+(\.[0-9]+)?$"
                        min={0}
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) =>
                          handleRepsChange(
                            e.target.value,
                            set,
                            exerciseIndex,
                            setIndex
                          )
                        }
                        className="w-[80px] rounded-xl p-2.5 text-[22px] text-gray-900"
                      />
                      reps @
                      <input
                        type="number"
                        inputMode="decimal"
                        pattern="^[0-9]+(\.[0-9]+)?$"
                        step={0.1}
                        min={0}
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) =>
                          handleWeightChange(
                            e.target.value,
                            set,
                            exerciseIndex,
                            setIndex
                          )
                        }
                        className="w-[90px] rounded-xl p-2.5 text-[22px] text-gray-900"
                      />
                      kg
                      <div
                        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                        className="ml-3 flex cursor-pointer text-sm text-slate-400"
                      >
                        <CloseSquare set="curved" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Button
                    auto
                    ghost
                    size="sm"
                    onPress={() => handleAddSet(exerciseIndex)}
                  >
                    + Add set
                  </Button>
                </div>
              </div>
              <div
                onClick={() => handleRemoveExercise(exerciseIndex)}
                className="ml-3 flex cursor-pointer text-lg text-slate-400"
              >
                <CloseSquare set="curved" />
              </div>
            </div>
          ))}

        {hasAddedBodyWeight && (
          <div className="flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-400 p-4 text-xl">
              Body weight:
              <input
                type="number"
                inputMode="decimal"
                pattern="^[0-9]+(\.[0-9]+)?$"
                step={0.1}
                min={1}
                placeholder="0"
                value={bodyWeight}
                style={{ fontSize: 22 }}
                onChange={(e) =>
                  setBodyWeight(e.target.value.replace(/,/, "."))
                }
                className="w-[90px] rounded-xl p-2.5 text-[22px] text-gray-900"
              />
              kg
            </div>
            <div
              onClick={handleRemoveBodyWeight}
              className="ml-3 flex cursor-pointer text-lg text-slate-400"
            >
              <CloseSquare set="curved" />
            </div>
          </div>
        )}
      </div>

      {renderButtons()}
    </div>
  );
};

export default WorkoutBuilder;
