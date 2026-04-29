"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { 
  PlayCircle, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  CheckCircle2,
  Menu,
  X,
  Loader2
} from "lucide-react";
import Cookies from "js-cookie";

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  isLocked?: boolean;
}

export default function StudentLessonViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchLessons = async () => {
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://localhost:8000/lessons/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      const lessonArrayRaw = Array.isArray(data) ? data : (data.data ?? []);
      const purchasedStatus = data.isPurchased ?? false; 
      setIsPurchased(purchasedStatus);

      const processedLessons = lessonArrayRaw.map((lesson: Lesson, index: number) => ({
        ...lesson,
        isLocked: index >= 3 && !purchasedStatus ? true : false,
      }));

      setLessons(processedLessons);

      if (processedLessons.length > 0) {
        setSelectedLesson(prev => {
           if (!prev) return processedLessons[0];
           return processedLessons.find((l: Lesson) => l.id === prev.id) || processedLessons[0];
        });
      }
    } catch (error) {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");
    if (resultCode === "0") {
      toast.success("Payment Successful!");
      fetchLessons();
      router.replace(`/student/courses/${id}/lessons`);
    } else if (resultCode && resultCode !== "0") {
      toast.error("Payment failed or was canceled.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (id) fetchLessons();
  }, [id]);

  const handlePayment = async () => {
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to proceed");
      return;
    }
    const toastId = toast.loading("Connecting to MoMo...");
    try {
      const res = await fetch(`http://localhost:8000/payments/momo/${id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (data.payUrl) {
        toast.dismiss(toastId);
        window.location.href = data.payUrl;
      } else {
        toast.error(data.message || "Payment failed", { id: toastId });
      }
    } catch {
      toast.error("Connection failed", { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-500 font-medium animate-pulse">Loading lessons...</p>
    </div>
  );

  if (!selectedLesson) return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center bg-gray-50">
      <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
        <PlayCircle size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">No Content</h2>
        <Link href="/student/courses" className="text-blue-600 font-bold hover:underline">Return to My Courses</Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden relative">
      <Toaster position="top-right" richColors />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-white">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b sticky top-0 bg-white/90 backdrop-blur-md z-30 shadow-sm">
          <Link href="/student/courses" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-[10px] sm:text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="mr-2" size={16} /> 
            <span className="hidden sm:inline">Back to My Courses</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* {isPurchased && (
              <span className="hidden sm:flex items-center gap-1 text-green-600 text-[10px] font-black bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 uppercase tracking-widest">
                <CheckCircle2 size={12} /> PRO Access
              </span>
            )} */}
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

        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto">
          {selectedLesson.isLocked ? (
            /* PAYWALL OVERLAY - Giao diện cao cấp */
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-900 rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                <Lock size={40} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 uppercase tracking-tighter">Content Locked</h2>
              <p className="text-gray-400 mb-8 max-w-md text-sm sm:text-base font-medium">
                You've enjoyed the free preview! Unlock the full Edurio experience to access all modules and premium PDF resources.
              </p>
              <button 
                onClick={handlePayment} 
                className="w-full sm:w-auto px-10 py-4 bg-[#A50064] text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-[#820050] transition-all transform hover:scale-105 shadow-2xl shadow-pink-500/20 active:scale-95"
              >
                Unlock with MoMo
              </button>
            </div>
          ) : (
            /* LESSON CONTENT AREA */
            <>
              {selectedLesson.videoUrl ? (
                <div className="relative aspect-video w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-black mb-8 border-[6px] border-gray-50">
                  <iframe 
                    width="100%" height="100%" 
                    src={selectedLesson.videoUrl} 
                    title="Lesson Player" 
                    allowFullScreen 
                    className="absolute inset-0" 
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-[2.5rem] bg-gray-50 flex flex-col items-center justify-center mb-8 border-2 border-dashed border-gray-200">
                  <PlayCircle className="text-gray-200 mb-2" size={48} />
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No video available</p>
                </div>
              )}

              <div className="mb-8">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                  {selectedLesson.title}
                </h1>
                <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
              </div>

              <div className="prose prose-blue max-w-none mb-10">
                <div className="text-gray-700 leading-relaxed text-base sm:text-xl italic bg-gray-50 p-6 sm:p-10 rounded-[2rem] border border-gray-100 relative shadow-inner">
                  <span className="absolute top-4 left-4 text-5xl text-gray-200 font-serif leading-none">"</span>
                  {selectedLesson.content}
                </div>
              </div>

              {selectedLesson.pdfUrl && (
                <div className="bg-gray-900 rounded-[2.5rem] p-6 sm:p-10 text-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <FileText size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-600 rounded-2xl">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-xl uppercase tracking-tighter">Resources</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Downloadable PDF</p>
                      </div>
                    </div>
                    <a 
                      href={`http://localhost:8000${selectedLesson.pdfUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl uppercase text-xs tracking-widest"
                    >
                      View Document <ChevronRight size={18} />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CURRICULUM SIDEBAR */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-0 lg:flex w-full lg:w-[400px] bg-white lg:bg-gray-50/50 border-l border-gray-100 h-full flex-col shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Curriculum</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{lessons.length} Modules</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                {lesson.isLocked ? (
                  <Lock size={16} />
                ) : (
                  <>
                    <span className="text-[9px] uppercase opacity-60 leading-none mb-0.5">No.</span>
                    <span className="text-sm leading-none">{String(index + 1).padStart(2, '0')}</span>
                  </>
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`font-bold text-[13px] uppercase tracking-tight truncate mb-1 ${selectedLesson.id === lesson.id ? "text-gray-900" : ""}`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-2 opacity-60">
                  <PlayCircle size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {lesson.isLocked ? "Locked" : "Video Lesson"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}