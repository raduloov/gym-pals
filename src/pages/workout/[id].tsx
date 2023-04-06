import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/Layout";
import { generateSSGHelper } from "~/server/utils/ssgHelper";
import { WorkoutView } from "~/components/WorkoutView";

const SingleWorkoutPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.workouts.getById.useQuery({
    id,
  });

  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>{`${data.workout.title ?? ""} - @${
          data.author.username
        }`}</title>
      </Head>
      <PageLayout>
        <WorkoutView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.workouts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SingleWorkoutPage;
