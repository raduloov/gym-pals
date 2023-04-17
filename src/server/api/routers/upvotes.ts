import { clerkClient } from "@clerk/nextjs/server";
import type { Upvote } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/utils/filterUserForClient";

const addUserDataToUpvote = async (upvotes: Upvote[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: upvotes.map((upvote) => upvote.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return upvotes.map((upvote) => {
    const author = users.find((user) => user.id === upvote.authorId);

    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for upvote not found",
      });

    return {
      upvote,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

export const upvotesRouter = createTRPCRouter({
  getUpvotesForWorkout: publicProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const upvotes = await ctx.prisma.upvote.findMany({
        where: { workoutId: input.workoutId },
      });

      return addUserDataToUpvote(upvotes);
    }),

  createUpvoteForWorkout: privateProcedure
    .input(z.object({ workoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: { id: input.workoutId },
      });

      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found",
        });
      }

      const isUpvoted = await ctx.prisma.upvote.findFirst({
        where: {
          workoutId: input.workoutId,
          authorId: ctx.userId,
        },
      });

      if (isUpvoted) {
        return await ctx.prisma.upvote.delete({
          where: {
            id: isUpvoted.id,
          },
        });
      }

      return await ctx.prisma.upvote.create({
        data: {
          workout: {
            connect: { id: input.workoutId },
          },
          authorId: ctx.userId,
        },
      });
    }),
});
