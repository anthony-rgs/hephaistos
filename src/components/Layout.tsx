import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MobileGuard from "./MobileGuard";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      {pathname !== "/" && <MobileGuard />}
      <Navbar />
      <div className="pt-14">
        <Outlet />
      </div>
    </>
  );
}
