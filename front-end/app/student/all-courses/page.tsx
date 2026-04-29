"use client";

import { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "sonner";
import Cookies from "js-cookie";
import { Search } from "lucide-react";

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #ff9966, #ff5e62)",
  "linear-gradient(135deg, #56ccf2, #2f80ed)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #ff758c, #ff7eb3)",
];

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = Cookies.get("accessToken");
    try {
      const [resCourses, resMy] = await Promise.all([
        fetch("http://localhost:8000/courses/public"),
        token ? fetch("http://localhost:8000/enrollments/me", { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ json: () => [] })
      ]);
      const dataCourses = await resCourses.json();
      const myData = token ? await resMy.json() : [];
      
      setCourses(Array.isArray(dataCourses) ? dataCourses : []);
      setEnrolledIds(myData.map((e: any) => e.course.id));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleEnrollment = async (courseId: number) => {
    const token = Cookies.get("accessToken");
    const isEnrolled = enrolledIds.includes(courseId);

    try {
      const res = await fetch(`http://localhost:8000/enrollments${isEnrolled ? `/${courseId}` : ""}`, {
        method: isEnrolled ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: isEnrolled ? null : JSON.stringify({ courseId }),
      });

      if (res.ok) {
        toast.success(isEnrolled ? "Unenrolled successfully!" : "Enrolled successfully!");
        setEnrolledIds(prev => isEnrolled ? prev.filter(id => id !== courseId) : [...prev, courseId]);
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("An error occurred.");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  }, [courses, search]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Available Courses</h1>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search courses..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const isEnrolled = enrolledIds.includes(course.id);
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              <div 
                className="h-40 flex items-center justify-center p-6 text-white text-xl font-bold text-center" 
                style={{ background: gradients[index % gradients.length] }}
              >
                <span className="line-clamp-2">{course.title}</span>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-md font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3rem]">
                  {course.title}
                </h3>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-extrabold text-blue-600">
                      {course.price === 0 ? "Free" : course.price.toLocaleString("vi-VN") + "đ"}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleEnrollment(course.id)}
                    className={`w-full py-2.5 text-sm font-semibold rounded-xl transition ${
                      isEnrolled 
                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll Now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}