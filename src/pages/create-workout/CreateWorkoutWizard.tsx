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
import { useRouter } from "next/router";

export const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutTypeClient | null>(null);

  const { data: allExercises, isLoading: exercisesLoading } =
    api.exercises.getAll.useQuery();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.workouts.create.useMutation({
    onSuccess: async () => {
      await ctx.workouts.getAll.invalidate();
      await router.push("/");
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
    <div className="flex flex-col items-center justify-center">
      <div className="fborder mb-8 flex w-full gap-3 rounded-l-full">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <input
          placeholder="New workout 💪"
          className="grow bg-transparent text-2xl"
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
      </div>

      {selectedWorkoutType && !selectedExercises.length && (
        <div className="text-xl">{"Let's get to work! 💪"}</div>
      )}

      {allExercises && (
        <WorkoutBuilder
          allExercises={allExercises}
          selectedExercises={selectedExercises}
          setSelectedExercises={setSelectedExercises}
          selectedWorkoutType={selectedWorkoutType}
          setSelectedWorkoutType={setSelectedWorkoutType}
        />
      )}

      {selectedExercises.length > 0 && (
        <div className="flex w-full justify-end p-1">
          <Button onClick={handlePostWorkout} label="Post workout" />
        </div>
      )}
    </div>
  );
};
