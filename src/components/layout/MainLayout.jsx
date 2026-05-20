import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// MainLayout - huvudlayout med navbar och outlet för sidinnehål
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}