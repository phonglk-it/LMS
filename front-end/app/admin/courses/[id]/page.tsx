"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { 
  Save, 
  UserPlus, 
  BookOpen, 
  PlusCircle, 
  ArrowLeft, 
  Settings, 
  DollarSign, 
  FileText, 
  Type,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react"; 

interface Instructor {
  id: number;
  fullName: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  instructor?: Instructor | null;
}

export default function AdminCourseManagePage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingInstructor, setChangingInstructor] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        const [courseRes, instructorRes] = await Promise.all([
          fetch(`http://localhost:8000/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8000/users?role=INSTRUCTOR`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!courseRes.ok || !instructorRes.ok) throw new Error();

        const courseData = await courseRes.json();
        const instructorData = await instructorRes.json();

        setCourse(courseData);
        setInstructors(instructorData.data ?? []);
        setInstructorId(courseData.instructor?.id ?? null);
      } catch {
        toast.error("Failed to load course");
        router.push("/admin/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, router]);

  const handleSave = async () => {
    if (!course) return;
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:8000/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          price: course.price,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Course updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!course) return;
    try {
      const res = await fetch(`http://localhost:8000/courses/${course.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Course deleted successfully");
      router.push("/admin/courses");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleChangeInstructor = async () => {
    if (!course || !instructorId) return;
    try {
      setChangingInstructor(true);
      const res = await fetch(`http://localhost:8000/courses/${course.id}/change-instructor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instructorId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Instructor assigned successfully");
    } catch {
      toast.error("Failed to change instructor");
    } finally {
      setChangingInstructor(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen flex-col gap-3 italic text-gray-500">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      Loading course management...
    </div>
  );
  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* STICKY HEADER - Tối ưu padding cho mobile */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => router.push("/admin/courses")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-tight">Manage Course</h1>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">ID: #{course.id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
              course.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {course.isPublished ? "Live" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* GENERAL INFO */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Settings size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-800 uppercase text-xs md:text-sm">General Information</h2>
            </div>
            <div className="p-5 md:p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  <Type size={14} /> Course Title
                </label>
                <input
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all text-gray-800 font-medium text-sm md:text-base"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  <FileText size={14} /> Description
                </label>
                <textarea
                  rows={5}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all text-gray-800 text-sm md:text-base"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  <DollarSign size={14} /> Pricing (USD)
                </label>
                <input
                  type="number"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-mono font-bold text-blue-600"
                  value={course.price}
                  onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                />
              </div>

              <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 text-sm"
                >
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                  {saving ? "Saving..." : "Save Information"}
                </button>
                
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3.5 rounded-xl font-bold hover:bg-red-100 active:scale-95 transition-all text-sm"
                >
                  <Trash2 size={18} />
                  Delete Course
                </button>
              </div>
            </div>
          </section>

          {/* CURRICULUM SECTION */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-tight">
                  CURRICULUM <span className="font-sans mx-1">&</span> LESSONS
                </h2>
                <p className="text-gray-500 text-xs md:text-sm">Manage the structure and content of this course.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link href={`/admin/courses/${course.id}/lessons`} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-xs md:text-sm border border-gray-200">
                  <BookOpen size={18} /> List
                </Link>
                <Link href={`/admin/courses/${course.id}/lessons/create`} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100 text-xs md:text-sm">
                  <PlusCircle size={18} /> Add New
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Instructor) */}
        <div className="space-y-6 md:space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <UserPlus size={18} className="text-purple-600" />
              <h2 className="font-bold text-gray-800 uppercase text-xs md:text-sm">Instructor</h2>
            </div>
            <div className="p-5 md:p-6">
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">Assign an instructor to this course.</p>
                <select
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all text-sm font-semibold text-gray-700 bg-gray-50"
                  value={instructorId ?? ""}
                  onChange={(e) => setInstructorId(Number(e.target.value))}
                >
                  <option value="">-- No instructor assigned --</option>
                  {instructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.fullName}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleChangeInstructor}
                disabled={changingInstructor || !instructorId}
                className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-100 disabled:opacity-30 text-sm"
              >
                {changingInstructor ? "Assigning..." : "Assign Instructor"}
              </button>
              
              {course.instructor && (
                <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Current</p>
                  <p className="font-bold text-purple-900 text-sm md:text-base">{course.instructor.fullName}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center text-red-500 mb-4">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900 mb-2">Delete Course?</h3>
            <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed">This action cannot be undone. All course content will be permanently removed.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="order-2 sm:order-1 flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm">Cancel</button>
              <button onClick={handleDelete} className="order-1 sm:order-2 flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}