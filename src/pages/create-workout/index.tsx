import type { NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/common/Layout";
import CreateWorkoutWizard from "./CreateWorkoutWizard";

export interface Exercise {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

const CreateWorkoutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>New workout</title>
      </Head>
      <PageLayout>
        <div className="max-h-screen overflow-hidden p-4">
          <CreateWorkoutWizard />
        </div>
      </PageLayout>
    </>
  );
};

export default CreateWorkoutPage;
