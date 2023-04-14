import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="h-screen w-screen">
      <div className="w-full md:max-w-2xl">{props.children}</div>
    </main>
  );
};
