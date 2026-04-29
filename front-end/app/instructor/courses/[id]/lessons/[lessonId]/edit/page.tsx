"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, ArrowLeft, Save, Film, Type, BookOpen, Layers, Loader2 } from "lucide-react";

export default function EditLessonPage() {
  const { id, lessonId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`http://localhost:8000/lessons/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const lessons = Array.isArray(data) ? data : data.data ?? [];
        const lesson = lessons.find((l: any) => l.id === Number(lessonId));
        if (!lesson) { toast.error("Lesson not found"); return; }
        setTitle(lesson.title || "");
        setContent(lesson.content || "");
        setVideoUrl(lesson.videoUrl || "");
        setOrder(lesson.order || 0);
        if (lesson.pdfUrl) setExistingPdf(lesson.pdfUrl);
      })
      .finally(() => setLoading(false));
  }, [id, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("videoUrl", videoUrl);
      formData.append("order", order.toString());
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch(`http://localhost:8000/lessons/${lessonId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("Lesson updated successfully");
      router.push(`/instructor/courses/${id}/lessons`);
    } catch { toast.error("Error updating lesson"); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="font-medium">Loading lesson details...</p>
    </div>
  );

  const pdfUrl = existingPdf ? `http://localhost:8000${existingPdf.startsWith("/") ? existingPdf : `/${existingPdf}`}` : null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Edit Lesson</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider">Course ID: #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5 sm:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Type size={14} className="text-blue-500" /> Title
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
                required 
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Film size={14} className="text-blue-500" /> Video URL
              </label>
              <input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
                placeholder="https://youtube.com/..." 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                <Layers size={14} className="text-blue-500" /> Order Sequence
              </label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(Number(e.target.value))} 
                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
              <BookOpen size={14} className="text-blue-500" /> Content Description
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 h-32 sm:h-40 focus:border-blue-500 focus:bg-white bg-gray-50/50 outline-none transition-all text-sm sm:text-base" 
              placeholder="Describe the lesson objectives..."
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
              Lesson Materials (PDF)
            </label>
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center gap-4 bg-gray-50/30">
              {pdfUrl && !pdfFile && (
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <FileText size={16} /> View Current Document
                </a>
              )}
              
              <div className="flex flex-col items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-700">
                  <Upload size={18} className="text-blue-600" />
                  <span className="truncate max-w-[200px]">
                    {pdfFile ? pdfFile.name : "Choose New PDF"}
                  </span>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    hidden 
                    onChange={(e) => e.target.files && setPdfFile(e.target.files[0])} 
                  />
                </label>
                <p className="text-[10px] text-gray-400 font-medium uppercase">Max size: 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={updating} 
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
        >
          {updating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Update Lesson Details</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}