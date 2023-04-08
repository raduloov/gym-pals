import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen w-screen justify-center overflow-hidden">
      <div className="w-full md:max-w-2xl">{props.children}</div>
    </main>
  );
};
