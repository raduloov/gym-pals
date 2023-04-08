import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/common/Loading";
import { PageLayout } from "~/components/common/Layout";
import { WorkoutView } from "~/components/WorkoutView";
import Link from "next/link";
import { Button, ButtonType } from "~/components/common/Button";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.workouts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex h-screen flex-col overflow-y-scroll">
      {data.map((fullWorkout) => (
        <WorkoutView {...fullWorkout} key={fullWorkout.workout.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.workouts.getAll.useQuery();

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />; // TODO: Handle this better

  return (
    <PageLayout>
      <div className="flex items-center justify-between border-b border-slate-400">
        <div className="flex justify-center p-4">
          <div className="flex flex-col items-center">
            <h1 className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-2xl font-extrabold text-transparent">
              Gym Pals
            </h1>
            <h2 className="text-[10px]">Social workout tracker</h2>
          </div>
        </div>
        {!isSignedIn && (
          <div className="mx-4">
            <SignInButton>
              <Button label={"Sign in"} type={ButtonType.SECONDARY} />
            </SignInButton>
          </div>
        )}
        {isSignedIn && (
          <Link href={"/create-workout"} className="mx-4">
            <Button label={"Add a workout"} type={ButtonType.SECONDARY} />
          </Link>
        )}
      </div>

      <Feed />
    </PageLayout>
  );
};

export default Home;
