import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Video,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ContentManager() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    targetClass: "",
    contentType: "document",
  });
  const [myContent, setMyContent] = useState([]);

  const fetchMyContent = async () => {
    try {
      const res = await api.get("/academic/teacher-history");
      setMyContent(res.data.data);
    } catch (err) {
      console.error("History sync failed");
    }
  };

  useEffect(() => {
    fetchMyContent();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select a document or video first.");
    if (!formData.title || !formData.targetClass || !formData.subject) {
      return toast.error("Title, Subject, and Class are mandatory.");
    }

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("targetClass", formData.targetClass);
    data.append("contentType", formData.contentType);
    data.append(
      "isScannedNote",
      formData.contentType === "document" ? "true" : "false",
    );

    try {
      await api.post("/academic/upload", data);
      toast.success("Publication successful!");
      setFile(null);
      setFormData((prev) => ({ ...prev, title: "" }));
      fetchMyContent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = (url) => {
  if (!url) return toast.error("Asset link is missing.");

  const isPdf = url.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  } else {
    window.open(url, "_blank");
  }
};
  const deleteMaterial = async (id) => {
    if (!window.confirm("Remove this material permanently?")) return;
    try {
      await api.delete(`/academic/delete/${id}`);
      toast.success("Removed successfully.");
      fetchMyContent();
    } catch (err) {
      toast.error("Delete operation failed.");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-5 animate-in fade-in duration-700 p-2 md:p-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-8 bg-white">
          <CardHeader className="bg-slate-900 text-white pb-8">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <UploadCloud className="text-indigo-400" /> Dispatch Center
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold italic text-[10px] uppercase">
              Digitizing Knowledge for Students
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-5">
            <form onSubmit={handleUpload} className="space-y-5">
              <div
                className={`group border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-indigo-400 bg-slate-50/50"}`}
                onClick={() => document.getElementById("file-input").click()}
              >
                <UploadCloud
                  className={file ? "text-indigo-600" : "text-slate-300"}
                  size={44}
                />
                <p className="mt-4 text-[10px] text-slate-500 font-black uppercase text-center px-4">
                  {file ? file.name : "Select JPG/PNG or PDF/MP4"}
                </p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Material Title"
                  className="rounded-xl h-14 bg-slate-50 border-none font-bold"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Select
                  onValueChange={(v) =>
                    setFormData({ ...formData, subject: v })
                  }
                >
                  <SelectTrigger className="rounded-xl h-14 bg-slate-50 border-none font-bold">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {[
                      "Mathematics",
                      "English Language",
                      "Physics",
                      "Biology",
                      "Chemistry",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    defaultValue="document"
                    onValueChange={(v) =>
                      setFormData({ ...formData, contentType: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl h-14 bg-slate-50 border-none font-bold">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="document">Study Note</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, targetClass: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl h-14 bg-slate-50 border-none font-bold">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"].map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl font-black uppercase italic shadow-xl"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Deploy to Library"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3 space-y-6">
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="text-indigo-600" size={24} />
          <h3 className="text-2xl font-black italic text-slate-900 uppercase">
            Teacher History
          </h3>
        </div>
        <div className="grid gap-4">
          {myContent.length > 0 ? (
            myContent.map((item) => (
              <Card
                key={item._id}
                className="border-none bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all group border-l-4 border-transparent hover:border-indigo-500"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className={`p-4 rounded-2xl ${item.contentType === "video" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
                    >
                      {item.contentType === "video" ? (
                        <Video size={24} />
                      ) : (
                        <FileText size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-sm">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase">
                          {item.subject}
                        </Badge>
                        <span className="font-bold text-slate-300 uppercase italic">
                          Targets {item.targetClass}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleView(item.fileUrl)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    >
                      <Eye size={20} />
                    </Button>
                    <Button
                      onClick={() => deleteMaterial(item._id)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
              <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">
                Vault is empty.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
