import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 
import AnnouncementBanner from "../components/AnnouncementBanner"; 

export default function DashboardLayout() {
  const role = localStorage.getItem("role"); 
  const token = localStorage.getItem("token");
  const location = useLocation();

  console.log("--- NO-PROTECTION DEBUG ---");
  console.log("Stored Token:", token ? "Exists" : "MISSING");
  console.log("Stored Role:", role);
  console.log("Current Path:", location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
     
      <Sidebar role={role || "student"} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AnnouncementBanner />

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-4 md:p-8 mt-12 lg:mt-0">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}