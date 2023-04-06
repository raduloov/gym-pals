import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/common/Layout";
import { LoadingSpinner } from "~/components/common/Loading";
import { api } from "~/utils/api";
import { WorkoutTypesContainer } from "~/components/WorkoutTypesContainer";
import { Button } from "~/components/common/Button";
import type { Workout } from "~/mappers/workoutTypeMapper";

interface Exercise {
  name: string;
  sets: {
    weight: number;
    reps: number;
  }[];
}

const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("New workout 💪");
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.workouts.create.useMutation({
    onSuccess: async () => {
      setInput("");
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

  if (!user) return null;

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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                mutate({ title: input });
              }
            }
          }}
        />
        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}

        {input != "" && !isPosting && (
          <Button
            onClick={() => mutate({ title: input })}
            label="Post workout"
          />
        )}
      </div>

      {!selectedWorkoutType && (
        <WorkoutTypesContainer
          onSelect={(workoutType) => setSelectedWorkoutType(workoutType)}
        />
      )}

      {selectedWorkoutType && (
        <div>
          <button
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

const CreateWorkoutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>New workout</title>
      </Head>
      <PageLayout>
        <div className="p-4">
          <CreateWorkoutWizard />
        </div>
      </PageLayout>
    </>
  );
};

export default CreateWorkoutPage;
