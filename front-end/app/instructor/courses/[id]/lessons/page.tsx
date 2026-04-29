"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  PlayCircle, 
  FileText, 
  ChevronRight, 
  Edit3, 
  ArrowLeft, 
  Trash2, 
  AlertTriangle,
  PlusCircle,
  Menu,
  X,
  Loader2
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
}

export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchLessons = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    try {
      const res = await fetch(`http://localhost:8000/lessons/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const lessonArray = Array.isArray(data) ? data : data.data ?? [];
      setLessons(lessonArray);
      if (lessonArray.length > 0) setSelectedLesson(lessonArray[0]);
      else setSelectedLesson(null);
    } catch {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [id]);

  const handleDelete = async () => {
    if (!selectedLesson) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://localhost:8000/lessons/${selectedLesson.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      
      toast.success("Lesson deleted successfully");
      setIsDeleteModalOpen(false);
      fetchLessons();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-500 font-medium animate-pulse">Loading course content...</p>
    </div>
  );
  
  if (!selectedLesson) return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center bg-gray-50">
      <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <PlayCircle size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Lessons Found</h2>
        <p className="text-gray-500 max-w-xs mb-6">This course doesn't have any content yet. Start by creating your first lesson.</p>
        <Link href={`/instructor/courses/${id}/lessons/create`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <PlusCircle size={20} /> Add First Lesson
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden relative">
      
      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b sticky top-0 bg-white/90 backdrop-blur-md z-30 shadow-sm">
          <Link href="/instructor/courses" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-[10px] sm:text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="mr-2" size={16} /> 
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
             <div className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-tighter">
               Lesson {lessons.findIndex(l => l.id === selectedLesson.id) + 1} of {lessons.length}
             </div>
             
             {/* Mobile Sidebar Toggle */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="lg:hidden p-2 bg-gray-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"
             >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 w-full">
          {/* VIDEO PLAYER SECTION */}
          {selectedLesson.videoUrl ? (
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black mb-8 border-[6px] border-gray-100">
              <iframe 
                width="100%" height="100%" 
                src={selectedLesson.videoUrl} 
                title="Lesson Player" 
                allowFullScreen 
                className="absolute inset-0" 
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-3xl bg-gray-50 flex flex-col items-center justify-center mb-8 border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <PlayCircle className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No video provided for this lesson</p>
            </div>
          )}

          {/* CONTENT HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">
                {selectedLesson.title}
              </h1>
              <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Link 
                href={`/instructor/courses/${id}/lessons/${selectedLesson.id}/edit`} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-3 rounded-2xl hover:bg-amber-600 transition-all font-bold text-xs uppercase shadow-lg shadow-amber-100"
              >
                <Edit3 size={16} /> Update
              </Link>
              <button 
                onClick={() => setIsDeleteModalOpen(true)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase border border-red-100 shadow-sm"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {/* DESCRIPTION BOX */}
          <div className="prose prose-blue max-w-none mb-10">
            <div className="text-gray-600 leading-relaxed text-base sm:text-xl italic bg-gray-50 p-6 sm:p-10 rounded-3xl border border-gray-100 relative">
              <span className="absolute top-4 left-4 text-4xl text-gray-200 font-serif leading-none">"</span>
              {selectedLesson.content}
            </div>
          </div>

          {/* DOWNLOADABLE RESOURCES */}
          {selectedLesson.pdfUrl && (
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-10 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <FileText size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter">Study Materials</h3>
                    <p className="text-gray-400 text-xs font-medium">Downloadable PDF document for this lesson</p>
                  </div>
                </div>
                <a 
                  href={`http://localhost:8000${selectedLesson.pdfUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                  Download Lesson PDF <ChevronRight size={20} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR (Curriculum) */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-0 lg:flex w-full lg:w-[400px] bg-white lg:bg-gray-50/50 border-l border-gray-100 h-full flex-col shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        {/* SIDEBAR HEADER */}
        <div className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Curriculum</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{lessons.length} Modules Available</p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/instructor/courses/${id}/lessons/create`} 
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
              title="Add New Lesson"
            >
              <PlusCircle size={20} />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        {/* LESSON LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {lessons.map((lesson, index) => (
            <button 
              key={lesson.id} 
              onClick={() => {
                setSelectedLesson(lesson);
                setIsSidebarOpen(false);
              }} 
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left border-2 
                ${selectedLesson.id === lesson.id 
                  ? "bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100/50 scale-[1.02]" 
                  : "bg-transparent border-transparent text-gray-400 hover:bg-white hover:border-gray-200"}`}
            >
              <div className={`w-12 h-12 shrink-0 flex flex-col items-center justify-center rounded-xl font-black
                ${selectedLesson.id === lesson.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                <span className="text-[10px] uppercase opacity-60 leading-none mb-0.5 font-bold">No.</span>
                <span className="text-sm leading-none">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="overflow-hidden">
                <p className={`font-bold text-[13px] uppercase tracking-tight truncate mb-1 ${selectedLesson.id === lesson.id ? "text-gray-900" : ""}`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-2 opacity-60">
                  <PlayCircle size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Video Lesson</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DELETE MODAL (English) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center text-red-500 mb-6">
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
                  <AlertTriangle size={40} />
               </div>
            </div>
            <h3 className="text-center text-2xl font-black text-gray-900 mb-2 tracking-tighter">Delete Lesson?</h3>
            <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed px-2">
              Are you sure you want to remove this lesson? This action will permanently delete all content and cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete} 
                className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Yes, Delete Lesson
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="w-full py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}