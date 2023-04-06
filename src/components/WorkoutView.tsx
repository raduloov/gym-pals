import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import { workoutTypeMapper } from "~/mappers/workoutTypeMapper";
import type { Prisma } from "@prisma/client";
import type { Exercise } from "~/pages/create-workout";

dayjs.extend(relativeTime);

type WorkoutWithUser = RouterOutputs["workouts"]["getAll"][number];

const parseWorkoutContentJSON = (content: Prisma.JsonValue): string => {
  let parsedContent = "";

  for (const exercise of Object.values(content as unknown as Exercise[])) {
    parsedContent += ` - ${exercise.name}:`;

    for (const [index, set] of exercise.sets.entries()) {
      parsedContent += ` ${set.reps}x${set.weight}kg`;

      if (index !== exercise.sets.length - 1) {
        parsedContent += ",";
      }
    }

    parsedContent += "\n";
  }

  return parsedContent;
};

export const WorkoutView = (props: WorkoutWithUser) => {
  const { workout, author } = props;

  return (
    <div key={workout.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-400">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span>{` · ${workoutTypeMapper(workout.workoutType)}`}</span>
          <Link href={`/workout/${workout.id}`}>
            <span className="font-thin">{` · ${dayjs(
              workout.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{workout.title}</span>
        <span className="whitespace-pre-wrap text-slate-400">
          {parseWorkoutContentJSON(workout.content)}
        </span>
      </div>
    </div>
  );
};
