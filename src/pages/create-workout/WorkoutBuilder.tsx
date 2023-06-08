import { WorkoutType } from "@prisma/client";
import { useState } from "react";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import { Button, Input, Modal, Text } from "@nextui-org/react";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import type { WeightliftingExcercise } from "@prisma/client";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import { CloseSquare } from "react-iconly";

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
        // Add 4 sets by default
        {
          weight: 0,
          reps: 0,
        },
        {
          weight: 0,
          reps: 0,
        },
        {
          weight: 0,
          reps: 0,
        },
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
            <Button flat onClick={() => setIsSelectingExercises(true)}>
              + Add exercise
            </Button>
            {!hasAddedBodyWeight && (
              <Button flat onClick={() => setHasAddedBodyWeight(true)}>
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
      <Modal
        closeButton
        blur
        open={isSelectingExercises}
        onClose={() => setIsSelectingExercises(false)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Choose your next exercise
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input placeholder="Search for an exercise" />
          <div className="h-[350px] overflow-y-auto">
            {allExercises?.map((exercise) => (
              <div
                className="cursor-pointer p-1"
                onClick={() => handleAddExercise(exercise)}
                key={exercise.id}
              >
                {exercise.title}
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onPress={() => setIsSelectingExercises(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
                      <Input
                        width="60px"
                        type="number"
                        step={0.1}
                        min={0}
                        animated={false}
                        placeholder="0"
                        value={set.reps}
                        style={{ fontSize: 22 }}
                        onChange={(e) =>
                          handleRepsChange(
                            parseFloat(e.target.value),
                            set,
                            exerciseIndex,
                            setIndex
                          )
                        }
                      />
                      reps @
                      <Input
                        width="80px"
                        type="number"
                        step={0.1}
                        min={0}
                        animated={false}
                        placeholder="0"
                        value={set.weight}
                        style={{ fontSize: 22 }}
                        onChange={(e) =>
                          handleWeightChange(
                            parseFloat(e.target.value),
                            set,
                            exerciseIndex,
                            setIndex
                          )
                        }
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
                    onClick={() => handleAddSet(exerciseIndex)}
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
              <Input
                width="80px"
                type="number"
                step={0.1}
                min={1}
                animated={false}
                placeholder="0"
                value={bodyWeight}
                style={{ fontSize: 22 }}
                onChange={(e) => setBodyWeight(Number(e.target.value))}
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
