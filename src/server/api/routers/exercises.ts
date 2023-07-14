import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exercisesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.weightliftingExcercise.findMany({
      take: 100,
    });

    return exercises;
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exercise = await ctx.prisma.weightliftingExcercise.create({
        data: {
          title: input.name,
        },
      });

      return exercise;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exercise = await ctx.prisma.weightliftingExcercise.delete({
        where: {
          id: input.id,
        },
      });

      return exercise;
    }),
});
