import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, UserPlus, Search, MoreVertical, UserCog, 
  Lock, History, CheckCircle2, Copy, Loader2 
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
import api from "@/lib/api";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${activeTab}&search=${search}`);
      setUsers(res.data.data.users);
    } catch (err) {
      toast.error("Failed to load registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [activeTab, search]);

  const copyToClipboard = (id, type) => {
    navigator.clipboard.writeText(id);
    toast.success(`${type} ID copied to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">User Registry</h1>
          <p className="text-slate-500 text-sm">Centralized identity and access management for Jeffjol LMS.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-12 px-6">
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 1. USER LIST */}
        <Card className="lg:col-span-3 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
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
                <p className="text-slate-400 text-sm font-medium">Reading registry...</p>
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
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{user.firstName} {user.lastName}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-tighter">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(user._id, user.role)}
                          className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Copy size={14} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}>
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200">
                            <DropdownMenuItem className="cursor-pointer font-medium"><UserCog className="mr-2 h-4 w-4" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer font-medium"><ShieldAlert className="mr-2 h-4 w-4" /> Reset Security</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600 cursor-pointer font-bold"><Lock className="mr-2 h-4 w-4" /> Suspend Account</DropdownMenuItem>
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

        {/* 2. AUDIT LOG */}
        <div className="space-y-6">
          <Card className="border-slate-200 rounded-[2rem] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                <History className="text-indigo-600" size={16} /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <LogItem action="Role Update" user="Admin_Nmezi" time="2m ago" detail="Promoted User #992 to Teacher" />
              <LogItem action="Security Log" user="System" time="14h ago" detail="Failed login attempt from IP 102.89.x.x" />
              <LogItem action="Family Link" user="Admin_Nmezi" time="1d ago" detail="Linked Student Chidera to Parent Nmezi" />
              <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 h-10 rounded-xl">
                Access Security Vault
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