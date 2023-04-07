export interface Exercise {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

interface Props {
  selectedExercises: Exercise[];
  onSelect: (exercises: Exercise[]) => void;
}

export const WorkoutBuilder = ({ selectedExercises, onSelect }: Props) => {
  const handleAddSet = (exerciseIndex: number) => {
    const currentExercise = selectedExercises[exerciseIndex];
    if (currentExercise) {
      currentExercise.sets.push({
        weight: 0,
        reps: 0,
      });
      const newExercises = [...selectedExercises];
      newExercises[exerciseIndex] = currentExercise;
      onSelect(newExercises);
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
      onSelect(newExercises);
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

  return (
    <div className="m-4 flex flex-wrap gap-10">
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
  );
};
