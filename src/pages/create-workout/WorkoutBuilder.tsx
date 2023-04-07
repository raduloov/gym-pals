import type { WeightliftingExcercise } from "@prisma/client";
import { useState } from "react";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";

export interface Exercise {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

interface Props {
  allExercises: WeightliftingExcercise[];
  selectedExercises: Exercise[];
  setSelectedExercises: (exercises: Exercise[]) => void;
  selectedWorkoutType: WorkoutTypeClient | null;
  setSelectedWorkoutType: (workoutType: WorkoutTypeClient) => void;
}

export const WorkoutBuilder = ({
  allExercises,
  selectedExercises,
  setSelectedExercises,
  selectedWorkoutType,
  setSelectedWorkoutType,
}: Props) => {
  const [isSelectingExercises, setIsSelectingExercises] = useState(false);

  const handleAddSet = (exerciseIndex: number) => {
    const currentExercise = selectedExercises[exerciseIndex];
    if (currentExercise) {
      currentExercise.sets.push({
        weight: 0,
        reps: 0,
      });
      const newExercises = [...selectedExercises];
      newExercises[exerciseIndex] = currentExercise;
      setSelectedExercises(newExercises);
    }
  };

  const handleInputsChange = (
    set: { weight: number; reps: number },
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
    value: number,
    set: { weight: number; reps: number },
    exerciseIndex: number,
    setIndex: number
  ) => {
    set.reps = value;
    handleInputsChange(set, exerciseIndex, setIndex);
  };

  const handleWeightChange = (
    value: number,
    set: { weight: number; reps: number },
    exerciseIndex: number,
    setIndex: number
  ) => {
    set.weight = value;
    handleInputsChange(set, exerciseIndex, setIndex);
  };

  const handleSelectNewExercise = (exercise: WeightliftingExcercise) => {
    const selectedExercise: Exercise = {
      name: exercise.title,
      sets: [
        {
          weight: 0,
          reps: 0,
        },
      ],
    };
    setSelectedExercises([...selectedExercises, selectedExercise]);
    setIsSelectingExercises(false);
  };

  return (
    <>
      {!selectedWorkoutType && (
        <WorkoutTypesContainer
          onSelect={(workoutType) => setSelectedWorkoutType(workoutType)}
        />
      )}

      {isSelectingExercises && (
        <div className="h-7/8 absolute top-2 mt-4 h-[90%] w-full flex-col overflow-y-scroll rounded-xl border bg-black p-4 sm:w-96">
          <div className="flex justify-between pb-2">
            <input className="w-3/4" />
            <button onClick={() => setIsSelectingExercises(false)}>X</button>
          </div>
          {allExercises?.map((exercise) => (
            <div
              className="cursor-pointer p-1 odd:bg-black even:bg-slate-800 hover:opacity-90"
              onClick={() => handleSelectNewExercise(exercise)}
              key={exercise.id}
            >
              {exercise.title}
            </div>
          ))}
        </div>
      )}

      <div className="m-4 flex flex-wrap justify-center gap-10">
        {selectedExercises.map((exercise, exerciseIndex) => (
          <div className="text-xl" key={exercise.name}>
            {`${exerciseIndex + 1}. ${exercise.name}`}
            <div className="my-1 flex flex-col">
              {exercise.sets.map((set, setIndex) => (
                <div className="my-1 flex" key={setIndex}>
                  <input
                    type="number"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) =>
                      handleRepsChange(
                        e.target.valueAsNumber,
                        set,
                        exerciseIndex,
                        setIndex
                      )
                    }
                    min={0}
                    className="mr-2 h-8 w-12 p-1 text-black"
                  />
                  reps @
                  <input
                    type="number"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) =>
                      handleWeightChange(
                        e.target.valueAsNumber,
                        set,
                        exerciseIndex,
                        setIndex
                      )
                    }
                    min={0}
                    className="mx-2 h-8 w-16 p-1 text-black"
                  />
                  kg
                </div>
              ))}
            </div>
            <div className="flex">
              <button
                onClick={() => handleAddSet(exerciseIndex)}
                type="button"
                className="mb-2 mr-2 rounded-lg border border-blue-700 px-3 py-2 text-center text-xs font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
              >
                + Add set
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedWorkoutType && !isSelectingExercises && (
        <div className="flex w-full justify-end">
          <button
            onClick={() => setIsSelectingExercises(true)}
            type="button"
            className="rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
          >
            + Add exercise
          </button>
        </div>
      )}
    </>
  );
};
