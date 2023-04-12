import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { Button } from "~/components/common/Button";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import { workoutTypeClientToPrismaMapper } from "~/mappers/workoutTypeMapper";
import WorkoutBuilder from "./WorkoutBuilder";
import { useRouter } from "next/router";
import { WorkoutType } from "@prisma/client";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import type { Exercise } from "./WorkoutBuilder";

const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutTypeClient | null>(null);
  const [bodyWeight, setBodyWeight] = useState<number>(0);

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
      const errorMessage = e.data?.zodError?.fieldErrors;
      if (errorMessage?.title) {
        toast.error("Please enter a title.");
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
      content: { exercises: selectedExercises, bodyWeight },
      workoutType: workoutTypeClientToPrismaMapper(
        selectedWorkoutType as WorkoutTypeClient
      ),
    });

  const renderCTA = (): JSX.Element | undefined => {
    if (
      selectedWorkoutType &&
      !selectedExercises.length &&
      selectedWorkoutType ===
        workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING)
    ) {
      return <div className="mt-8 text-xl">{"Let's get to work! 💪"}</div>;
    }
  };

  const renderPostButton = (): JSX.Element | undefined => {
    if (
      selectedWorkoutType !== null &&
      ((selectedExercises.length > 0 &&
        selectedWorkoutType ===
          workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING)) ||
        selectedWorkoutType !==
          workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING))
    ) {
      return (
        <div className="mt-2 flex w-full justify-end p-1">
          <Button onClick={handlePostWorkout} label="Post workout" />
        </div>
      );
    }
  };

  if (!user) return null; // TODO: Handle this better

  return (
    <div className="flex h-screen flex-col items-center">
      <div className="flex w-full gap-2 rounded-l-full border">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <input
          placeholder="New workout 💪"
          className="w-[200%] bg-transparent text-2xl outline-none"
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
        {selectedWorkoutType && (
          <div className="my-2 mr-2 inline-flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 p-0.5 text-xs font-medium text-white dark:text-white dark:focus:ring-blue-800">
            <span className="rounded-md px-1">{`${selectedWorkoutType}`}</span>
          </div>
        )}
      </div>

      {renderCTA()}

      {allExercises && (
        <WorkoutBuilder
          allExercises={allExercises}
          selectedExercises={selectedExercises}
          setSelectedExercises={setSelectedExercises}
          selectedWorkoutType={selectedWorkoutType}
          setSelectedWorkoutType={setSelectedWorkoutType}
          bodyWeight={bodyWeight}
          setBodyWeight={setBodyWeight}
        />
      )}

      {renderPostButton()}
    </div>
  );
};

export default CreateWorkoutWizard;
