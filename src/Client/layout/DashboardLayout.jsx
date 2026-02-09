import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, CreditCard, LogOut, 
  Users, Mail, Megaphone, ShieldCheck, GraduationCap, 
  Clock, BarChart3, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnnouncementBanner from "@/components/AnnouncementBanner"; 

const navLinks = {
  admin: [
    { name: "Pulse", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Approvals", path: "/admin/approvals", icon: CreditCard },
    { name: "Broadcast", path: "/admin/mail", icon: Mail },
    { name: "Noticeboard", path: "/admin/noticeboard", icon: Megaphone },
  ],
  teacher: [
    { name: "Overview", path: "/teacher", icon: BarChart3 },
    { name: "Grades", path: "/teacher/grades", icon: FileText },
    { name: "Content", path: "/teacher/content", icon: ShieldCheck },
    { name: "Questions", path: "/teacher/questions", icon: BookOpen },
    { name: "Schedule", path: "/teacher/schedule", icon: Clock },
  ],
  student: [
    { name: "Home", path: "/student", icon: LayoutDashboard },
    { name: "Library", path: "/student/library", icon: BookOpen },
    { name: "Exams", path: "/student/exams", icon: ShieldCheck },
    { name: "Results", path: "/student/results", icon: GraduationCap },
    { name: "Payments", path: "/student/payments", icon: CreditCard },
  ],
  parent: [
    { name: "Dashboard", path: "/parent", icon: LayoutDashboard },
    { name: "Results", path: "/parent/results", icon: GraduationCap },
    { name: "Bursary", path: "/parent/bursary", icon: CreditCard },
  ]
};

export default function DashboardLayout() {
  const role = localStorage.getItem("role") || "admin";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0 z-10">
        <div className="p-6 font-black text-2xl text-indigo-600 italic tracking-tighter">
          JEFFJOL
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks[role]?.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                pathname === link.path 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-rose-500 hover:bg-rose-50" onClick={handleLogout}>
            <LogOut className="mr-3 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <AnnouncementBanner />

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-8">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}