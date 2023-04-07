import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { Button } from "~/components/common/Button";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import { workoutTypeClientToPrismaMapper } from "~/mappers/workoutTypeMapper";
import type { Exercise } from "./WorkoutBuilder";
import { WorkoutBuilder } from "./WorkoutBuilder";

export const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const [title, setTitle] = useState("New workout 💪");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutTypeClient | null>(null);

  const { data: allExercises, isLoading: exercisesLoading } =
    api.exercises.getAll.useQuery();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.workouts.create.useMutation({
    onSuccess: async () => {
      await ctx.workouts.getAll.invalidate();
      toast.success("Workout posted!");
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

      {allExercises && (
        <WorkoutBuilder
          allExercises={allExercises}
          selectedExercises={selectedExercises}
          setSelectedExercises={setSelectedExercises}
          selectedWorkoutType={selectedWorkoutType}
          setSelectedWorkoutType={setSelectedWorkoutType}
        />
      )}
    </>
  );
};
