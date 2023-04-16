import { createTRPCRouter } from "~/server/api/trpc";
import { workoutsRouter } from "./routers/workouts";
import { profileRouter } from "./routers/profile";
import { exercisesRouter } from "./routers/exercises";
import { upvotesRouter } from "./routers/upvotes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  exercises: exercisesRouter,
  workouts: workoutsRouter,
  profile: profileRouter,
  upvotes: upvotesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
