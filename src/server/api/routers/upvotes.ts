import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const upvotesRouter = createTRPCRouter({
  getUpvotesForWorkout: publicProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const upvotes = await ctx.prisma.upvote.findMany({
        where: { workoutId: input.workoutId },
      });

      return upvotes;
    }),

  createUpvoteForWorkout: privateProcedure
    .input(z.object({ workoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: { id: input.workoutId },
      });

      if (!workout)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found",
        });

      const upvote = await ctx.prisma.upvote.create({
        data: {
          workout: {
            connect: { id: input.workoutId },
          },
          authorId: ctx.userId,
        },
      });

      console.log("upvote", upvote);
    }),
});
