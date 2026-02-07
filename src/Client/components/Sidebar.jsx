import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, CreditCard, 
  Users, Mail, ShieldCheck, Menu, X, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menuItems = {
  admin: [
    { name: "Pulse", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Payments", path: "/admin/approvals", icon: CreditCard },
    { name: "Broadcast", path: "/admin/mail", icon: Mail },
  ],
  teacher: [
    { name: "Overview", path: "/teacher", icon: LayoutDashboard },
    { name: "Grades", path: "/teacher/grades", icon: BookOpen },
    { name: "Content", path: "/teacher/content", icon: ShieldCheck },
  ],
  student: [
    { name: "Home", path: "/student", icon: LayoutDashboard },
    { name: "Library", path: "/student/library", icon: BookOpen },
    { name: "Results", path: "/student/results", icon: GraduationCap },
    { name: "Fees", path: "/student/payments", icon: CreditCard },
  ],
};

export default function Sidebar({ role }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 text-2xl font-black text-primary italic">JEFFJOL</div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems[role]?.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === item.path 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="px-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-rose-50 rounded-xl">
          <LogOut size={20} className="mr-3" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}