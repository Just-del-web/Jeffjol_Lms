import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, CreditCard, 
  Users, Mail, ShieldCheck, Menu, GraduationCap, 
  UserCheck, X, LogOut, Megaphone, FileText, BarChart3, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menuItems = {
  admin: [
    { name: "Pulse", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Approvals", path: "/admin/approvals", icon: CreditCard },
    { name: "Mail Center", path: "/admin/mail", icon: Mail },
    { name: "Noticeboard", path: "/admin/noticeboard", icon: Megaphone },
  ],
  teacher: [
    { name: "Analytics", path: "/teacher", icon: BarChart3 },
    { name: "Grade Entry", path: "/teacher/grades", icon: FileText },
    { name: "Content", path: "/teacher/content", icon: ShieldCheck },
    { name: "Question Bank", path: "/teacher/questions", icon: BookOpen },
    { name: "Schedule", path: "/teacher/schedule", icon: Clock },
  ],
  student: [
    { name: "Dashboard", path: "/student", icon: LayoutDashboard },
    { name: "Library", path: "/student/library", icon: BookOpen },
    { name: "Results", path: "/student/results", icon: GraduationCap },
    { name: "Payments", path: "/student/payments", icon: CreditCard },
    { name: "Exams", path: "/student/exams", icon: ShieldCheck },
    { name: "Analytics", path: "/student/analytics", icon: BarChart3 },
  ],
  parent: [
    { name: "Dashboard", path: "/parent", icon: LayoutDashboard },
    { name: "Results", path: "/parent/results", icon: GraduationCap },
    { name: "Bursary", path: "/parent/bursary", icon: CreditCard },
  ]
};

export default function Sidebar({ role }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 text-2xl font-black text-indigo-600 italic tracking-tighter">JEFFJOL</div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems[role]?.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === item.path 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="px-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl" onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
        }}>
          <LogOut size={20} className="mr-3" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md border-slate-200">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}