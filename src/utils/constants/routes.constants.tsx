import { Home, Logging } from "@/pages";

type Props = {
  path: string;
  element: React.ReactNode;
};

export const routes: Props[] = [
  { path: "/", element: <Home /> },
  { path: "/logging", element: <Logging /> },
  { path: "/blind-test", element: "<BlindTest />" },
  { path: "/video", element: "<Video />" },
  { path: "*", element: "<NotFound />" },
];
