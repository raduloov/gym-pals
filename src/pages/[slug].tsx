import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/common/Layout";
import Image from "next/image";
import { LoadingPage } from "~/components/common/Loading";
import { WorkoutView } from "~/components/WorkoutView";
import { generateSSGHelper } from "~/server/utils/ssgHelper";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { ChevronLeftCircle } from "react-iconly";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.workouts.getWorkoutsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullWorkout) => (
        <WorkoutView {...fullWorkout} key={fullWorkout.workout.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const router = useRouter();

  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>Gym-Pals | {data.username}</title>
      </Head>
      <div className="overflow-y-scroll">
        <PageLayout>
          <div className="relative h-36 border-slate-400 bg-slate-600">
            <div className="flex justify-end p-4">
              <Button
                icon={<ChevronLeftCircle set="light" primaryColor="white" />}
                light
                auto
                onPress={() => router.back()}
              />
            </div>
            <Image
              src={data.profileImageUrl}
              alt={`${data.username ?? ""}'s profile pic`}
              width={128}
              height={128}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-2 border-black bg-black"
            />
          </div>
          <div>
            <div className="flex justify-between">
              <div className="mt-16 p-4 text-2xl font-bold">{`@${
                data.username ?? ""
              }`}</div>
              <div className="flex w-full flex-col justify-between py-4">
                <div className="flex w-full justify-between px-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-xs text-slate-400">Workouts done</div>
                    <div>10</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-xs text-slate-400">
                      Favorite exercise
                    </div>
                    <div>Benchpress</div>
                  </div>
                </div>
                <div className="flex w-full justify-between px-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-xs text-slate-400">Favorite type</div>
                    <div>Weightlifting</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-xs text-slate-400">
                      Favorite exercise
                    </div>
                    <div>Benchpress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full border-b border-slate-400" />

          <ProfileFeed userId={data.id} />
        </PageLayout>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
