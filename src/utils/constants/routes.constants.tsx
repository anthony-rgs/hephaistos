import { CreateVideo, Home, LastJob, Logging } from "@/pages";

type Props = {
  path: string;
  element: React.ReactNode;
};

export const publicRoutes: Props[] = [
  { path: "/", element: <Home /> },
  { path: "/logging", element: <Logging /> },
];

export const routes: Props[] = [
  { path: "/create-video", element: <CreateVideo /> },
  { path: "/last-job", element: <LastJob /> },
  { path: "/create-blind-test", element: "<BlindTest />" },
  { path: "*", element: "<NotFound />" },
];
