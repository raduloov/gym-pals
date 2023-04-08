import type { WeightliftingExcercise } from "@prisma/client";
import { useState } from "react";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import { Button, ButtonSize, ButtonType } from "~/components/common/Button";
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
  bodyWeight: number;
  setBodyWeight: (bodyWeight: number) => void;
}

const WorkoutBuilder = ({
  allExercises,
  selectedExercises,
  setSelectedExercises,
  selectedWorkoutType,
  setSelectedWorkoutType,
  bodyWeight,
  setBodyWeight,
}: Props) => {
  const [isSelectingExercises, setIsSelectingExercises] = useState(false);
  const [hasAddedBodyWeight, setHasAddedBodyWeight] = useState(false);

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

  const handleAddExercise = (exercise: WeightliftingExcercise) => {
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

  const handleRemoveExercise = (exerciseIndex: number) =>
    setSelectedExercises(
      selectedExercises.filter((_, index) => index !== exerciseIndex)
    );

  const handleRemoveBodyWeight = () => {
    setBodyWeight(0);
    setHasAddedBodyWeight(false);
  };

  return (
    <div className="mt-2 max-h-[80%] w-full overflow-y-scroll">
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
              onClick={() => handleAddExercise(exercise)}
              key={exercise.id}
            >
              {exercise.title}
            </div>
          ))}
        </div>
      )}

      <div className="m-4 flex flex-wrap justify-center gap-5">
        {selectedExercises &&
          selectedExercises.map((exercise, exerciseIndex) => (
            <div className="flex items-center" key={exercise.name}>
              <div className="rounded-xl border border-slate-400 p-4 text-xl">
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
                        inputMode="decimal"
                        step={0.1}
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
                        inputMode="decimal"
                        step={0.1}
                        min={0}
                        className="mx-2 h-8 w-16 p-1 text-black"
                      />
                      kg
                      <div
                        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                        className="ml-3 flex text-sm text-slate-400"
                      >
                        x
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Button
                    label={"+ Add set"}
                    type={ButtonType.SECONDARY}
                    size={ButtonSize.SMALL}
                    onClick={() => handleAddSet(exerciseIndex)}
                  />
                </div>
              </div>
              <div
                onClick={() => handleRemoveExercise(exerciseIndex)}
                className="ml-3 flex text-lg text-slate-400"
              >
                x
              </div>
            </div>
          ))}

        {hasAddedBodyWeight && (
          <div className="flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-400 p-4 text-xl">
              Body weight:
              <input
                type="number"
                placeholder="0"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.valueAsNumber)}
                min={1}
                className="h-8 w-12 p-1 text-black"
              />
              kg
            </div>
            <div
              onClick={handleRemoveBodyWeight}
              className="ml-3 flex text-lg text-slate-400"
            >
              x
            </div>
          </div>
        )}
      </div>

      {selectedWorkoutType && !isSelectingExercises && (
        <div className="flex justify-end">
          <div className="flex flex-col gap-1">
            <Button
              label={"+ Add exercise"}
              type={ButtonType.SECONDARY}
              onClick={() => setIsSelectingExercises(true)}
            />
            {!hasAddedBodyWeight && (
              <Button
                label={"+ Add body weight"}
                type={ButtonType.SECONDARY}
                onClick={() => setHasAddedBodyWeight(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;
