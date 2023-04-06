export const getUsernameFromEmail = (email: string): string => {
  const [username] = email.split("@");

  return username ?? email;
};
