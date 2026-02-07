import React, { useState, useEffect } from "react";
import { Search, FileText, PlayCircle, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SubjectLibrary() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibrary = async () => {
      const res = await axios.get("/api/v1/academic/library", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMaterials(res.data.data);
    };
    fetchLibrary();
  }, []);

  const filtered = materials.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(search.toLowerCase()) || 
                          item.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Library</h1>
          <p className="text-slate-500">Access your class notes, videos, and scanned materials.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            className="pl-10 border-slate-200" 
            placeholder="Search subjects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="note">Notes</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <Card key={item._id} className="overflow-hidden border-slate-200 hover:border-indigo-300 transition-all hover:shadow-md group cursor-pointer"
                onClick={() => navigate(`/student/read/${item._id}`)}>
            <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
              {item.type === 'video' ? (
                <PlayCircle className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={48} />
              ) : (
                <FileText className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={48} />
              )}
              <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 hover:bg-white" variant="outline">
                {item.subject}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t bg-slate-50/50 flex justify-between">
              <span className="text-xs font-medium text-slate-600">Teacher {item.uploadedBy.lastName}</span>
              <BookOpen size={14} className="text-slate-400" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}