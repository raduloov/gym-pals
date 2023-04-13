import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/common/Loading";
import { PageLayout } from "~/components/common/Layout";
import { WorkoutView } from "~/components/WorkoutView";
import Link from "next/link";
import { Avatar, Dropdown, Button } from "@nextui-org/react";
import { useRouter } from "next/router";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.workouts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    // TODO: Fix scrolling issue
    <div className="flex h-screen flex-col overflow-y-scroll">
      {data.map((fullWorkout) => (
        <WorkoutView {...fullWorkout} key={fullWorkout.workout.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const ctx = api.useContext();
  const router = useRouter();
  const { signOut } = useClerk();

  // Start fetching asap
  api.workouts.getAll.useQuery();

  const { data: user } = api.profile.getCurrentUser.useQuery();

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />; // TODO: Handle this better

  return (
    <PageLayout>
      <div className="flex items-center justify-between border-b border-slate-400">
        <div
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            await ctx.workouts.getAll.invalidate();
          }}
          className="flex flex-col items-center p-4"
        >
          <h1 className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-2xl font-extrabold text-transparent">
            Gym Pals
          </h1>
          <h2 className="text-[10px]">Social workout tracker</h2>
        </div>
        {!isSignedIn && (
          <div className="mx-4">
            <SignInButton>
              <Button>Sign in</Button>
            </SignInButton>
          </div>
        )}
        {isSignedIn && user && (
          <div className="flex items-center gap-2 px-2">
            <Link href={"/create-workout"}>
              <Button ghost auto>
                +
              </Button>
            </Link>

            <Dropdown>
              <Dropdown.Trigger>
                <Avatar as="button" size="lg" src={user?.profileImageUrl} />
              </Dropdown.Trigger>
              <Dropdown.Menu aria-label="Static Actions">
                <Dropdown.Item key="profile">
                  <div
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      await router.push(`/@${user.username}`);
                    }}
                  >
                    Profile
                  </div>
                </Dropdown.Item>
                <Dropdown.Item key="settings">Settings</Dropdown.Item>
                <Dropdown.Item key="Sign out" color="error">
                  <div
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => await signOut()}
                  >
                    Sign out
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>

      <Feed />
    </PageLayout>
  );
};

export default Home;
