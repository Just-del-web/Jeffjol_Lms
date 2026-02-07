import React, { useState } from "react";
import { 
  ShieldAlert, 
  UserPlus, 
  Search, 
  MoreVertical, 
  UserCog, 
  Lock, 
  History,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Registry & Security</h1>
          <p className="text-slate-500 text-sm">Manage staff roles, student access, and system audit logs.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="mr-2 h-4 w-4" /> Register New Staff
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 1. USER LIST (LEFT 3 COLUMNS) */}
        <Card className="lg:col-span-3 border-slate-200 overflow-hidden">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100/50">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="teacher">Teachers</TabsTrigger>
                  <TabsTrigger value="student">Students</TabsTrigger>
                  <TabsTrigger value="parent">Parents</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input className="pl-9 h-9 text-sm" placeholder="Search by name or ID..." />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6">Name / Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right pr-6">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example Row */}
                <TableRow className="group">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">Justice Nmezi</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-tighter">Software Teacher</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">2026-02-07 14:20</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer">
                          <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                          <Lock className="mr-2 h-4 w-4" /> Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 2. AUDIT LOG (RIGHT 1 COLUMN) */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="text-indigo-600" size={16} /> Recent Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LogItem 
                action="Grade Modified" 
                user="Admin_Jeff" 
                time="2m ago" 
                detail="SS1 Mathematics Grade changed for Student #204"
              />
              <LogItem 
                action="Account Suspended" 
                user="Admin_Jeff" 
                time="14h ago" 
                detail="Parent Account #991 restricted (Fees)"
              />
              <LogItem 
                action="Mass Promotion" 
                user="System" 
                time="1d ago" 
                detail="JSS3 students promoted to SS1"
              />
              <Button variant="outline" className="w-full text-xs font-semibold py-1">
                View Full Logs
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
    <div className="space-y-1 border-l-2 border-slate-100 pl-3 pb-2">
      <div className="flex justify-between items-center">
        <p className="text-[11px] font-bold text-slate-700">{action}</p>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
      <p className="text-[10px] text-slate-500 line-clamp-1">{detail}</p>
      <p className="text-[9px] text-indigo-400">By {user}</p>
    </div>
  );
}