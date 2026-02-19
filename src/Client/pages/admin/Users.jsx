import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, UserPlus, Search, MoreVertical, UserCog, 
  Lock, History, CheckCircle2, Copy, Loader2, ArrowUpCircle, UserCheck, Trash2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

const CLASSES = [
  "Playgroup", "Pre-Nursery", "Nursery 1", "Nursery 2", "Reception",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [promoData, setPromoData] = useState({ from: "", to: "" });
  const [promoLoading, setPromoLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${activeTab}&search=${search}`);
      setUsers(res.data.data.users || []);
    } catch (err) {
      toast.error("Failed to load registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [activeTab, search]);

  const handleStatusChange = async (userId, newStatus) => {
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await api.patch("/operations/admin/user-status", { userId, status: newStatus });
      toast.success(`Account successfully marked as ${newStatus}`, { id: loadingToast });
      await fetchUsers(); // Re-fetch data to update UI state
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed.", { id: loadingToast });
    }
  };

  const handlePromotion = async () => {
    if (!promoData.from || !promoData.to) return toast.error("Select both classes.");
    setPromoLoading(true);
    try {
      const res = await api.post("/operations/admin/promote", { 
        fromClass: promoData.from, 
        toClass: promoData.to 
      });
      toast.success(res.data.message);
      await fetchUsers();
    } catch (err) {
      toast.error("Promotion cycle failed.");
    } finally {
      setPromoLoading(false);
    }
  };

  const copyToClipboard = (id, type) => {
    navigator.clipboard.writeText(id);
    toast.success(`${type} ID copied!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">User Registry</h1>
          <p className="text-slate-500 text-sm">Manage student status and school-wide promotions.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-indigo-200 text-indigo-600 font-bold rounded-xl h-12">
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Bulk Promote
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl bg-white">
              <DialogHeader>
                <DialogTitle className="font-black italic uppercase tracking-tighter">Class Advancement</DialogTitle>
                <DialogDescription>Move students to the next level.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Select onValueChange={(v) => setPromoData({ ...promoData, from: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="From Class" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => setPromoData({ ...promoData, to: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="To Class" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handlePromotion} disabled={promoLoading} className="w-full bg-indigo-600 rounded-xl h-12 font-black uppercase italic">
                  {promoLoading ? <Loader2 className="animate-spin" /> : "Confirm Promotion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3 border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
          <CardHeader className="bg-white pb-4 border-b">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100 rounded-xl p-1">
                  <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                  <TabsTrigger value="teacher" className="rounded-lg">Teachers</TabsTrigger>
                  <TabsTrigger value="student" className="rounded-lg">Students</TabsTrigger>
                  <TabsTrigger value="parent" className="rounded-lg">Parents</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200" 
                  placeholder="Search name or email..." 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" />
                <p className="text-slate-400 text-sm font-medium tracking-tighter uppercase italic">Syncing Registry...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-6 uppercase text-[10px] font-black">User Identity</TableHead>
                    <TableHead className="uppercase text-[10px] font-black text-center">Copy ID</TableHead>
                    <TableHead className="uppercase text-[10px] font-black text-center">Status</TableHead>
                    <TableHead className="text-right pr-6 uppercase text-[10px] font-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className="group hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 uppercase italic tracking-tighter">{user.firstName} {user.lastName}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-tighter">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => copyToClipboard(user._id, user.role)}
                          className="h-8 w-8 rounded-lg hover:bg-indigo-50"
                        >
                          <Copy size={14} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {/* ROBUST BADGE LOGIC */}
                        <Badge 
                          variant="outline" 
                          className={`rounded-lg px-2 py-0.5 font-black italic border-none text-[10px] uppercase ${
                            user.profile?.status === 'suspended' ? 'bg-amber-50 text-amber-700' :
                            user.profile?.status === 'withdrawn' ? 'bg-rose-50 text-rose-700' :
                            user.profile?.status === 'active' || user.isActive ? 'bg-emerald-50 text-emerald-700' : 
                            'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {/* Prioritize the status string from the StudentProfile schema */}
                          {user.profile?.status || (user.isActive ? "Active" : "Suspended")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl bg-white p-2 border-slate-100">
                            <DropdownMenuItem className="cursor-pointer font-bold text-xs rounded-xl">
                              <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user._id, 'active')}
                              className="cursor-pointer font-bold text-xs rounded-xl text-emerald-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Set as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user._id, 'suspended')}
                              className="cursor-pointer font-bold text-xs rounded-xl text-amber-600"
                            >
                              <Lock className="mr-2 h-4 w-4" /> Suspend Account
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user._id, 'withdrawn')}
                              className="cursor-pointer font-bold text-xs rounded-xl text-rose-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Withdraw Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 rounded-[2rem] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                <History className="text-indigo-600" size={16} /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <LogItem action="Status" user="Admin_Nmezi" time="Just Now" detail="Modified user permission flags" />
              <LogItem action="Security" user="System" time="1h ago" detail="Class list promotion completed" />
              <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
                System Vault
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LogItem({ action, user, time, detail }) {
  return (
    <div className="space-y-1 border-l-4 border-indigo-100 pl-4 pb-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{action}</p>
        <span className="text-[9px] font-bold text-slate-400">{time}</span>
      </div>
      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{detail}</p>
      <p className="text-[9px] font-bold text-indigo-500 italic mt-1">Executor: {user}</p>
    </div>
  );
}