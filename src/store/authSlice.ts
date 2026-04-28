import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  username: string | null;
  isAdmin: boolean;
  features: string[];
  maxJobs: number;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  username: localStorage.getItem("username"),
  isAdmin: localStorage.getItem("isAdmin") === "true",
  features: JSON.parse(localStorage.getItem("features") ?? "[]"),
  maxJobs: Number(localStorage.getItem("maxJobs") ?? 1),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ token: string; username: string }>) {
      state.token = action.payload.token;
      state.username = action.payload.username;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("username", action.payload.username);
    },
    setUserData(
      state,
      action: PayloadAction<{ username: string; isAdmin: boolean; features: string[]; maxJobs: number }>,
    ) {
      state.username = action.payload.username;
      state.isAdmin = action.payload.isAdmin;
      state.features = action.payload.features;
      state.maxJobs = action.payload.maxJobs;
      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("isAdmin", String(action.payload.isAdmin));
      localStorage.setItem("features", JSON.stringify(action.payload.features));
      localStorage.setItem("maxJobs", String(action.payload.maxJobs));
    },
    logout(state) {
      state.token = null;
      state.username = null;
      state.isAdmin = false;
      state.features = [];
      state.maxJobs = 1;
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("features");
      localStorage.removeItem("maxJobs");
    },
  },
});

export const { loginSuccess, logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
