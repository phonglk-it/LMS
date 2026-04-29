"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Cookies from "js-cookie";
import { Search } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  instructor?: { fullName: string } | null;
}

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #ff9966, #ff5e62)",
  "linear-gradient(135deg, #56ccf2, #2f80ed)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #ff758c, #ff7eb3)",
];

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = Cookies.get("accessToken");
      const res = await fetch("http://localhost:8000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return courses.filter((c) => c.title.toLowerCase().includes(keyword));
  }, [courses, search]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Courses</h1>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my courses..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const gradient = gradients[index % gradients.length];
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              <div className="h-40 flex items-center justify-center p-6 text-white text-xl font-bold text-center" style={{ background: gradient }}>
                <span className="line-clamp-2">{course.title}</span>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                  {course.title}
                </h3>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-bold text-blue-600">
                      {course.price === 0 ? "Free" : course.price.toLocaleString("vi-VN") + "đ"}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${course.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <Link
                    href={`/instructor/courses/${course.id}/lessons`}
                    className="block w-full py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl text-center hover:bg-gray-800 transition"
                  >
                    Manage Content
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-gray-400">No courses assigned to you.</div>
      )}
    </div>
  );
}