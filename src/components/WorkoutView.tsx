import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import { workoutTypePrismaToClientMapper } from "~/mappers/workoutTypeMapper";
import { WorkoutType } from "@prisma/client";
import type { Workout } from "@prisma/client";
import type { Exercise } from "~/pages/create-workout";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { Chat, Heart, Send } from "react-iconly";

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

export const WorkoutView = (props: WorkoutWithUser) => {
  const [isLiked, setIsLiked] = useState(false);

  const { workout, author } = props;

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

      <Button.Group style={{ width: "100%" }} color="WHITE" light>
        <Button
          icon={
            isLiked ? (
              <Heart set="bold" primaryColor="red" />
            ) : (
              <Heart set="light" primaryColor="red" />
            )
          }
          style={{ width: "100%" }}
          onPress={() => {
            setIsLiked(!isLiked);
          }}
        >
          Like
        </Button>
        <Button icon={<Chat set="curved" />} style={{ width: "100%" }}>
          Comment
        </Button>
      </Button.Group>
    </div>
  );
};
