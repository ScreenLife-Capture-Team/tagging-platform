import { create } from "zustand";
import { app } from "@/client";
import { User } from "screenlife-platform-server";

export const useAuth = create<{
  user: User | undefined;
  loggedIn: boolean;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => Promise<User>;
  initialLogin: () => void;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}>((set, get) => ({
  user: undefined,
  loggedIn: false,
  login: async ({ username, password }) => {
    const data = {
      strategy: "local",
      email: username,
      password,
    };
    try {
      const res = await app.authenticate(data);
      const user = res.user;

      set({ loggedIn: true, user });
      return user;
    } catch (err: any) {
      console.error("login error", err);
      throw err;
    }
  },
  logout: async () => {
    set({ loggedIn: false, user: undefined });
    app.logout();
  },
  initialLogin: async () => {
    try {
      const res = await app.reAuthenticate();
      const user = res.user as any; // temp
      set({ loggedIn: true, user, loading: false });
    } catch (e) {
      console.error("ilogin error", e);
      set({ loggedIn: false, user: undefined, loading: false });
    }
  },
  loading: true,
  refetchUser: async () => {
    const res = await app.reAuthenticate();
    const user = res.users;
    set({ user });
  },
}));
