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

export interface Exercise {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

const CreateWorkoutWizard = () => {
  const { user } = useUser();

  const [title, setTitle] = useState("New workout 💪");
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<Workout | null>(null);
  const [isSelectingExercises, setIsSelectingExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  console.log("selectedExercises", selectedExercises);

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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (title !== "") {
                mutate({ title, content: selectedExercises });
              }
            }
          }}
        />
        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}

        {title != "" && !isPosting && (
          <Button
            onClick={() => mutate({ title, content: selectedExercises })}
            label="Post workout"
          />
        )}
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
        <div className="m-4 flex flex-wrap gap-10">
          {selectedExercises.map((exercise, index) => (
            <div className="text-xl" key={exercise.name}>
              {`${index + 1}. ${exercise.name}`}
              <div className="my-1 flex flex-col">
                {exercise.sets.map((set, idx) => (
                  <div className="my-1 flex" key={idx}>
                    <input
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => {
                        set.reps = e.target.valueAsNumber;
                        const currentExercise = selectedExercises[index];
                        if (currentExercise) {
                          currentExercise.sets[idx] = {
                            weight: set.weight,
                            reps: set.reps,
                          };
                          const newExercises = [...selectedExercises];
                          newExercises[index] = currentExercise;
                          setSelectedExercises(newExercises);
                        }
                      }}
                      min={0}
                      className="mr-2 h-8 w-12 p-1 text-black"
                    />
                    reps @
                    <input
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => {
                        set.weight = e.target.valueAsNumber;
                        const currentExercise = selectedExercises[index];
                        if (currentExercise) {
                          currentExercise.sets[idx] = {
                            weight: set.weight,
                            reps: set.reps,
                          };
                          const newExercises = [...selectedExercises];
                          newExercises[index] = currentExercise;
                          setSelectedExercises(newExercises);
                        }
                      }}
                      min={0}
                      className="mx-2 h-8 w-16 p-1 text-black"
                    />
                    kg
                  </div>
                ))}
              </div>
              <div className="flex">
                <button
                  onClick={() => {
                    const currentExercise = selectedExercises[index];
                    if (currentExercise) {
                      currentExercise.sets.push({
                        weight: 0,
                        reps: 0,
                      });
                      const newExercises = [...selectedExercises];
                      newExercises[index] = currentExercise;
                      setSelectedExercises(newExercises);
                    }
                  }}
                  type="button"
                  className="mb-2 mr-2 rounded-lg border border-blue-700 px-3 py-2 text-center text-xs font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
                >
                  + Add set
                </button>
              </div>
            </div>
          ))}
        </div>
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
