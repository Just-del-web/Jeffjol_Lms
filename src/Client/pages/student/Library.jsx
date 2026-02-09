import React, { useState, useEffect } from "react";
import { Search, FileText, PlayCircle, BookOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        toast.error("Failed to load library content.");
        console.error("Library Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filtered = materials.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(search.toLowerCase()) || 
                          item.title.toLowerCase().includes(search.toLowerCase());
    // Match 'contentType' (from your Content model) with the tab value
    const matchesTab = activeTab === "all" || item.contentType === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. TOP HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Library</h1>
          <p className="text-slate-500 text-sm">Everything you need for your class, all in one place.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            className="pl-10 border-slate-200 focus:ring-indigo-500 rounded-xl" 
            placeholder="Search notes or subjects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 2. FILTERS */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All Content</TabsTrigger>
          <TabsTrigger value="note" className="rounded-lg">Study Notes</TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg">Video Lessons</TabsTrigger>
          <TabsTrigger value="live_class" className="rounded-lg">Live Classes</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 3. MATERIAL GRID */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length > 0 ? filtered.map((item) => (
            <Card 
              key={item._id} 
              className="overflow-hidden border-slate-200 hover:border-indigo-300 transition-all hover:shadow-lg group cursor-pointer rounded-2xl"
              onClick={() => navigate(`/student/read/${item._id}`)}
            >
              <div className="aspect-video bg-slate-50 flex items-center justify-center relative">
                {item.contentType === 'video' ? (
                  <PlayCircle className="text-slate-200 group-hover:text-indigo-500 group-hover:scale-110 transition-all" size={56} />
                ) : (
                  <FileText className="text-slate-200 group-hover:text-indigo-500 group-hover:scale-110 transition-all" size={56} />
                )}
                <Badge className="absolute top-3 right-3 bg-white/90 text-indigo-600 border-none shadow-sm" variant="outline">
                  {item.subject}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Posted: {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="px-4 py-3 border-t bg-slate-50/30 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">
                  Teacher {item.uploadedBy?.lastName || "Admin"}
                </span>
                <BookOpen size={14} className="text-slate-300" />
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed rounded-3xl">
              <p className="text-slate-400 font-medium italic">No materials found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}