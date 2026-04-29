"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ArrowLeft, PlusCircle, Type, Film, Layers, BookOpen, Loader2 } from "lucide-react";

export default function AddLessonPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) { toast.error("You are not authenticated"); return; }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("videoUrl", videoUrl);
      formData.append("order", order.toString());
      formData.append("courseId", id as string);
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch("http://localhost:8000/lessons", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Lesson created successfully");
      setTimeout(() => router.push(`/instructor/courses/${id}/lessons`), 1000);
    } catch {
      toast.error("Error creating lesson");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 sm:p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Create New Lesson</h2>
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Adding to Course #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5 sm:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Type size={14} className="text-green-600" /> Lesson Title
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-green-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
                required 
                placeholder="Enter lesson title..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Film size={14} className="text-green-600" /> Video URL
              </label>
              <input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-green-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
                placeholder="https://youtube.com/..." 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Layers size={14} className="text-green-600" /> Order Sequence
              </label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(Number(e.target.value))} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-green-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
              <BookOpen size={14} className="text-green-600" /> Content Description
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 h-32 sm:h-40 focus:border-green-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
              placeholder="What is this lesson about?"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
              Lesson Materials (PDF)
            </label>
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50/30">
              <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 shadow-sm">
                <Upload size={18} className="text-green-600" />
                <span className="max-w-[150px] sm:max-w-xs truncate">
                  {pdfFile ? pdfFile.name : "Choose PDF file"}
                </span>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  hidden 
                  onChange={(e) => e.target.files && setPdfFile(e.target.files[0])} 
                />
              </label>
              <p className="text-[10px] text-gray-400 font-medium">Max size: 10MB</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={creating} 
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <PlusCircle size={20} />
              <span>Create New Lesson</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}