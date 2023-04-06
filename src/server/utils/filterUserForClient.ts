import type { User } from "@clerk/nextjs/dist/api";

const getUsernameFromEmail = (email: string) => {
  const [username] = email.split("@");
  return username;
};

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username:
      user.username ??
      getUsernameFromEmail(user.emailAddresses[0]?.emailAddress ?? ""),
    profileImageUrl: user.profileImageUrl,
  };
};
