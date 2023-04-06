import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/utils/filterUserForClient";
import type { Workout } from "@prisma/client";

const addUserDataToWorkouts = async (workouts: Workout[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: workouts.map((workout) => workout.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return workouts.map((workout) => {
    const author = users.find((user) => user.id === workout.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for workout not found",
      });

    return {
      workout,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const workoutsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: { id: input.id },
      });

      if (!workout) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToWorkouts([workout]))[0];
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.prisma.workout.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToWorkouts(workouts);
  }),

  getWorkoutsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.workout
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToWorkouts)
    ),

  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      console.log("title", input.title);

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const workout = await ctx.prisma.workout.create({
        data: {
          authorId,
          title: input.title,
        },
      });

      return workout;
    }),
});