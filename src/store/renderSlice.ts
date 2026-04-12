import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RenderStatus =
  | "pending"
  | "downloading"
  | "processing"
  | "done"
  | "failed"
  | "cancelled";

export type ClipRenderStatus = "pending" | "downloading" | "done";

export interface ClipRenderData {
  id: string;
  title: string;
  status: ClipRenderStatus;
}

export interface RenderJob {
  job_id: string;
  status: RenderStatus;
  title: string;
  created_at: string;
  updated_at?: string;
  error: string | null;
  message?: string;
  clips?: ClipRenderData[];
}

interface RenderState {
  job: RenderJob | null;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: RenderState = {
  job: null,
};

const renderSlice = createSlice({
  name: "render",
  initialState,
  reducers: {
    setJob(state, action: PayloadAction<RenderJob>) {
      state.job = action.payload;
    },
    updateJob(state, action: PayloadAction<Partial<RenderJob>>) {
      if (state.job) {
        state.job = { ...state.job, ...action.payload };
      }
    },
    clearJob(state) {
      state.job = null;
    },
  },
});

export const { setJob, updateJob, clearJob } = renderSlice.actions;
export default renderSlice.reducer;
