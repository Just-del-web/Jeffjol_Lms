import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  PlayCircle,
  BookOpen,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SubjectLibrary() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await api.get("/academic/library");
        setMaterials(res.data.data);
      } catch (err) {
        toast.error("Network synchronization failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filtered = materials.filter((item) => {
    const matchesSearch =
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.title?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || item.contentType === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-2 md:p-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Academic <span className="text-indigo-600">Vault</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Digital resources synced to your current class.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            className="pl-10 border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-2xl h-12 bg-white shadow-sm"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABS - MOBILE SCROLLABLE */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full md:w-auto justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="all"
            className="rounded-xl px-6 font-bold uppercase text-[10px]"
          >
            All Materials
          </TabsTrigger>
          <TabsTrigger
            value="document"
            className="rounded-xl px-6 font-bold uppercase text-[10px]"
          >
            Study Notes
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="rounded-xl px-6 font-bold uppercase text-[10px]"
          >
            Lectures
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Card
                key={item._id}
                className="overflow-hidden border-none shadow-xl shadow-slate-100/50 hover:shadow-indigo-100 transition-all group cursor-pointer rounded-[2rem] bg-white border-b-4 border-transparent hover:border-indigo-500"
                onClick={() => navigate(`/student/read/${item._id}`)}
              >
                <div className="aspect-video bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {item.contentType === "video" ? (
                    <PlayCircle
                      className="text-slate-200 group-hover:text-indigo-500 group-hover:scale-110 transition-all"
                      size={64}
                    />
                  ) : (
                    <FileText
                      className="text-slate-200 group-hover:text-indigo-500 group-hover:scale-110 transition-all"
                      size={64}
                    />
                  )}
                  <Badge
                    className="absolute top-4 right-4 bg-white text-indigo-600 font-black italic border-none shadow-lg px-3 py-1 text-[9px] uppercase"
                    variant="outline"
                  >
                    {item.subject}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase text-sm">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">
                    Verified Resource
                  </p>
                </CardContent>
                <CardFooter className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Instructor {item.uploadedBy?.lastName || "Admin"}
                  </span>
                  <BookOpen size={14} className="text-indigo-200" />
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] opacity-50 italic text-sm">
              No resources found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
