import { Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CreditCard, LogOut, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = {
  student: [
    { name: "Dashboard", path: "/student", icon: LayoutDashboard },
    { name: "My Library", path: "/student/library", icon: BookOpen },
    { name: "Payments", path: "/student/payments", icon: CreditCard },
  ],
  teacher: [
    { name: "Overview", path: "/teacher", icon: LayoutDashboard },
    { name: "Upload Grades", path: "/teacher/grades", icon: UserCheck },
  ],
  admin: [
    { name: "School Pulse", path: "/admin", icon: LayoutDashboard },
    { name: "User Management", path: "/admin/users", icon: UserCheck },
  ]
};

export default function DashboardLayout() {
  const role = localStorage.getItem("role") || "student";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 font-bold text-xl text-indigo-600">Jeffjol LMS</div>
        <nav className="flex-1 px-4 space-y-2">
          {navLinks[role].map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <link.icon size={20} />
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}