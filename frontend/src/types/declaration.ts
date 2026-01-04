export type AuthType = "login" | "register";

export type Tabs = "Explore" | "Upload" | "Users";

export const TabRoutes = {
  explore: "Explore",
  upload: "Upload",
  users: "Users",
};

export type UserRole = "admin" | "editor" | "viewer";

export interface User {
  _id: string;
  username: string;
  role: UserRole;
}
