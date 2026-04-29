"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { Loader2, BookOpen } from "lucide-react";
const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #ff9966, #ff5e62)",
  "linear-gradient(135deg, #56ccf2, #2f80ed)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #ff758c, #ff7eb3)",
];

export default function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      const token = Cookies.get("accessToken");
      try {
        const res = await fetch("http://localhost:8000/enrollments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMyCourses(Array.isArray(data) ? data.map((item: any) => item.course) : []);
      } catch {
        toast.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-500 font-medium italic">Loading your library...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      <Toaster position="top-right" richColors />
      
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-900 text-center sm:text-left">
        My Enrolled Courses
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.length > 0 ? (
          myCourses.map((course, index) => (
            <div 
              key={course.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div 
                className="h-40 flex items-center justify-center p-6 text-white text-xl font-bold text-center transition-transform group-hover:scale-105 duration-500" 
                style={{ background: gradients[index % gradients.length] }}
              >
                <span className="line-clamp-2">{course.title}</span>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                  {course.title}
                </h3>
                
                <div className="mt-auto">
                  <Link 
                    href={`/student/courses/${course.id}/lessons`}
                    className="block w-full py-3 text-sm font-bold bg-black text-white rounded-xl text-center hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <BookOpen size={18} />
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">You haven't enrolled in any courses yet.</p>
            <Link href="/student/courses" className="text-blue-600 font-bold mt-2 inline-block hover:underline">
              Browse All Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}