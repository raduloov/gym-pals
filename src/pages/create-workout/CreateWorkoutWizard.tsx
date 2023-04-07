import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import { Button } from "~/components/common/Button";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import { workoutTypeClientToPrismaMapper } from "~/mappers/workoutTypeMapper";
import { WorkoutBuilder } from "./WorkoutBuilder";
import type { Exercise } from "./WorkoutBuilder";

export const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const [title, setTitle] = useState("New workout 💪");
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutTypeClient | null>(null);
  const [isSelectingExercises, setIsSelectingExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const { data: allExercises, isLoading: exercisesLoading } =
    api.exercises.getAll.useQuery();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.workouts.create.useMutation({
    onSuccess: async () => {
      await ctx.workouts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  useEffect(() => {
    let loadingToast = "";
    if (isPosting) {
      loadingToast = toast.loading("Posting workout...");
    }

    return () => toast.dismiss(loadingToast);
  }, [isPosting]);

  const handlePostWorkout = () =>
    mutate({
      title,
      content: selectedExercises,
      workoutType: workoutTypeClientToPrismaMapper(
        selectedWorkoutType as WorkoutTypeClient
      ),
    });

  if (!user) return null; // TODO: Handle this better

  return (
    <>
      <div className="mb-8 flex w-full gap-3">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <input
          placeholder="Workout title"
          className="grow bg-transparent text-2xl outline-none"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (title !== "") {
                handlePostWorkout();
              }
            }
          }}
        />

        <Button onClick={handlePostWorkout} label="Post workout" />
      </div>

      {!selectedWorkoutType && (
        <WorkoutTypesContainer
          onSelect={(workoutType) => setSelectedWorkoutType(workoutType)}
        />
      )}

      {isSelectingExercises && (
        <div className="mt-4 flex flex-col rounded-xl border p-4">
          {allExercises?.map((exercise) => (
            <div
              className="cursor-pointer p-1 even:bg-slate-800 hover:opacity-90"
              onClick={() => {
                const selectedExercise = {
                  name: exercise.title,
                  sets: [
                    {
                      weight: 0,
                      reps: 0,
                    },
                  ],
                };
                setSelectedExercises((prev) => [...prev, selectedExercise]);
                setIsSelectingExercises(false);
              }}
              key={exercise.id}
            >
              {exercise.title}
            </div>
          ))}
        </div>
      )}

      {selectedExercises.length > 0 && (
        <WorkoutBuilder
          selectedExercises={selectedExercises}
          onSelect={(exercises) => setSelectedExercises(exercises)}
        />
      )}

      {selectedWorkoutType && !isSelectingExercises && (
        <div>
          <button
            onClick={() => setIsSelectingExercises((prev) => !prev)}
            type="button"
            className="mb-2 mr-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
          >
            + Add exercise
          </button>
        </div>
      )}
    </>
  );
};
