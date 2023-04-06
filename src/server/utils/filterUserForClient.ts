import type { User } from "@clerk/nextjs/dist/api";
import { getUsernameFromEmail } from "./getUsernameFromEmail";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username:
      user.username ??
      getUsernameFromEmail(
        user.emailAddresses[0]?.emailAddress ?? "unknown user"
      ),
    profileImageUrl: user.profileImageUrl,
  };
};
