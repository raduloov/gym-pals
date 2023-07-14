import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { Button } from "@nextui-org/react";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import { workoutTypeClientToPrismaMapper } from "~/mappers/workoutTypeMapper";
import WorkoutBuilder from "./WorkoutBuilder";
import { useRouter } from "next/router";
import { WorkoutType } from "@prisma/client";
import type { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";
import type { Exercise } from "./WorkoutBuilder";
import { getWorkoutTypeButtonColorScheme } from "~/components/WorkoutTypesContainer";
import { ChevronLeftCircle } from "react-iconly";

const CreateWorkoutWizard = () => {
  const { user } = useUser();
  const router = useRouter();
  const ctx = api.useContext();

  const [title, setTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutTypeClient | null>(null);
  const [bodyWeight, setBodyWeight] = useState<string>("0");

  const { data: allExercises, isLoading: exercisesLoading } =
    api.exercises.getAll.useQuery();

  const { mutate: createWorkout, isLoading: isPosting } =
    api.workouts.create.useMutation({
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

  const { mutate: updateWorkout, isLoading: isUpdating } =
    api.workouts.update.useMutation({
      onSuccess: async () => {
        await ctx.workouts.getAll.invalidate();
        await router.push("/");
        toast.success("Workout updated!");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors;
        if (errorMessage?.title) {
          toast.error("Please enter a title.");
        } else {
          toast.error("Failed to update! Please try again later.");
        }
      },
    });

  const { workoutId } = router.query;
  const isEditing = !!workoutId;
  const { data: workoutData, isLoading: isWorkoutLoading } =
    api.workouts.getById.useQuery({
      id: workoutId as string,
    });

  // Populate fields if editing
  useEffect(() => {
    if (!isEditing || !workoutData || isWorkoutLoading) {
      return;
    }

    const { workout } = workoutData;
    const { exercises, bodyWeight } = JSON.parse(workout.content as string) as {
      exercises: Exercise[];
      bodyWeight: number;
    };

    setTitle(workout.title ?? "");
    setSelectedExercises(exercises);
    setSelectedWorkoutType(
      workoutTypePrismaToClientMapper(workout.workoutType)
    );
    setBodyWeight(bodyWeight.toString());
  }, [isEditing, workoutData, isWorkoutLoading]);

  useEffect(() => {
    let loadingToast = "";
    if (isPosting) {
      loadingToast = toast.loading("Posting workout...");
    } else if (isUpdating) {
      loadingToast = toast.loading("Updating workout...");
    }

    return () => toast.dismiss(loadingToast);
  }, [isPosting, isUpdating]);

  const handlePostWorkout = () => {
    if (isEditing) {
      return updateWorkout({
        id: workoutId as string,
        title,
        content: JSON.stringify({ exercises: selectedExercises, bodyWeight }),
        workoutType: workoutTypeClientToPrismaMapper(
          selectedWorkoutType as WorkoutTypeClient
        ),
      });
    }

    return createWorkout({
      title,
      content: JSON.stringify({ exercises: selectedExercises, bodyWeight }),
      workoutType: workoutTypeClientToPrismaMapper(
        selectedWorkoutType as WorkoutTypeClient
      ),
    });
  };

  const handleBack = () => {
    if (selectedWorkoutType) {
      return setSelectedWorkoutType(null);
    }

    return router.back();
  };

  const renderCTA = (): JSX.Element | null => {
    if (
      selectedWorkoutType &&
      !selectedExercises.length &&
      selectedWorkoutType ===
        workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING)
    ) {
      return (
        <div className="mt-8 flex w-full justify-center text-xl">
          {"Let's get to work! 💪"}
        </div>
      );
    }

    return null;
  };

  const renderPostButton = (): JSX.Element | null => {
    if (
      selectedWorkoutType !== null &&
      ((selectedExercises.length > 0 &&
        selectedWorkoutType ===
          workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING)) ||
        selectedWorkoutType !==
          workoutTypePrismaToClientMapper(WorkoutType.WEIGHTLIFTING))
    ) {
      return (
        <Button onClick={handlePostWorkout}>
          {isEditing ? "Update" : "Post"} workout
        </Button>
      );
    }

    return null;
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
          <div
            className={`${getWorkoutTypeButtonColorScheme(
              selectedWorkoutType
            )} my-2 mr-2 inline-flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-lg bg-gradient-to-r p-0.5 text-xs font-medium text-white`}
          >
            {selectedWorkoutType}
          </div>
        )}
      </div>

      <div className="w-full overflow-y-auto">
        {renderCTA()}

        {allExercises && (
          <WorkoutBuilder
            isEditing={isEditing}
            allExercises={allExercises}
            selectedExercises={selectedExercises}
            setSelectedExercises={setSelectedExercises}
            selectedWorkoutType={selectedWorkoutType}
            setSelectedWorkoutType={setSelectedWorkoutType}
            bodyWeight={bodyWeight}
            setBodyWeight={setBodyWeight}
          />
        )}

        <div className="mt-2 flex h-56 w-full flex-col items-end gap-1 p-1">
          {renderPostButton()}
          <Button
            icon={<ChevronLeftCircle set="light" primaryColor="white" />}
            // @ts-ignore
            color={"white"}
            light
            auto
            size="lg"
            onPress={handleBack}
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkoutWizard;
