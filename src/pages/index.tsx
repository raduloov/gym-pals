import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/common/Loading";
import { PageLayout } from "~/components/common/Layout";
import { WorkoutView } from "~/components/WorkoutView";
import Link from "next/link";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.workouts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
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
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex justify-center border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton>
              <div className="flex h-10 w-40 items-center justify-center bg-red-200 text-black">
                Sign in
              </div>
            </SignInButton>
          </div>
        )}
        {isSignedIn && (
          <Link href={"/create-workout"}>
            <div className="flex h-10 w-40 items-center justify-center bg-red-200 text-black">
              Add a workout
            </div>
          </Link>
        )}
      </div>

      <Feed />
    </PageLayout>
  );
};

export default Home;
