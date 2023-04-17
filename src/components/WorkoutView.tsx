import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import { WorkoutType } from "@prisma/client";
import type { Workout } from "@prisma/client";
import type { Exercise } from "~/pages/create-workout";
import { Avatar, Button, Loading } from "@nextui-org/react";
import { Chat, Heart } from "react-iconly";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

type WorkoutWithUser = RouterOutputs["workouts"]["getAll"][number];

const parseWorkoutContentJSON = (workout: Workout): string | null => {
  if (workout.workoutType !== WorkoutType.WEIGHTLIFTING) {
    return null;
  }

  const { exercises, bodyWeight } = workout.content as unknown as {
    exercises: Exercise[];
    bodyWeight: number;
  };

  let parsedContent = "";
  for (const exercise of Object.values(exercises)) {
    parsedContent += ` - ${exercise.name}:`;

    for (const [index, set] of exercise.sets.entries()) {
      parsedContent += ` ${set.reps}x${set.weight}kg`;

      if (index !== exercise.sets.length - 1) {
        parsedContent += ",";
      }
    }

    parsedContent += "\n";
  }

  if (bodyWeight > 0) {
    parsedContent += ` --> Body weight: ${bodyWeight}kg`;
  }

  return parsedContent;
};

export const WorkoutView = ({ workout, author }: WorkoutWithUser) => {
  const { user } = useUser();
  const ctx = api.useContext();

  const { data: upvotes } = api.upvotes.getUpvotesForWorkout.useQuery({
    workoutId: workout.id,
  });

  const userHasUpvoted = upvotes?.some(
    (upvote) => upvote.author.id === user?.id
  );

  const { mutate, isLoading } = api.upvotes.createUpvoteForWorkout.useMutation({
    onSuccess: async () => {
      await ctx.upvotes.getUpvotesForWorkout.invalidate({
        workoutId: workout.id,
      });
    },
    onError: (e) => {
      if (e.message === "UNAUTHORIZED") {
        toast.error("Please sign in to like a workout.");
      }
    },
  });

  return (
    <div
      key={workout.id}
      className="flex flex-col border-b border-slate-400 px-4 pt-4"
    >
      <div className="flex gap-3">
        <Image
          src={author.profileImageUrl}
          className="h-14 w-14 rounded-full"
          alt={`@${author.username}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 whitespace-nowrap text-slate-400">
            <Link href={`/@${author.username}`}>
              <span>{`@${author.username}`}</span>
            </Link>
            <span className="text-slate-400">
              {` · ${workoutTypePrismaToClientMapper(workout.workoutType)}`}
            </span>
            <Link href={`/workout/${workout.id}`}>
              <span className="whitespace-pre-wrap font-thin">{` · ${dayjs(
                workout.createdAt
              ).fromNow()}`}</span>
            </Link>
          </div>
          <span className="text-2xl">{workout.title}</span>
          <span className="whitespace-pre-wrap text-slate-400">
            {parseWorkoutContentJSON(workout)}
          </span>
        </div>
      </div>

      <Button.Group style={{ width: "100%" }} color="white" light>
        <Button
          icon={
            isLoading ? (
              <Loading type="spinner" />
            ) : userHasUpvoted ? (
              <Heart set="bold" primaryColor="red" />
            ) : (
              <Heart set="light" primaryColor="red" />
            )
          }
          style={{ width: "100%" }}
          onPress={() => {
            mutate({ workoutId: workout.id });
          }}
        >
          Like
        </Button>
        <Button disabled icon={<Chat set="curved" />} style={{ width: "100%" }}>
          Comment
        </Button>
      </Button.Group>

      <div className="w-full0 flex px-4 py-2">
        {upvotes && upvotes.length > 0 && `Liked by ${upvotes?.length ?? ""}`}
        <Avatar.Group animated={false} className="ml-4">
          {upvotes?.map((upvote, index) => (
            <Avatar
              key={index}
              size="sm"
              pointer
              src={upvote.author.profileImageUrl}
              stacked
            />
          ))}
        </Avatar.Group>
      </div>
    </div>
  );
};
