import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exercisesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.weightliftingExcercise.findMany({
      take: 100,
    });

    return exercises;
  }),
});
