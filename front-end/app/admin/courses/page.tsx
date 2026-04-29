"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { Plus, Loader2 } from "lucide-react"; 

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

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #ff9966, #ff5e62)",
  "linear-gradient(135deg, #56ccf2, #2f80ed)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #ff758c, #ff7eb3)",
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (!t) {
      toast.error("Please login again");
      return;
    }
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:8000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (course: Course) => {
    const url = `http://localhost:8000/courses/${course.id}/${
      course.isPublished ? "unpublish" : "publish"
    }`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Action failed");
      return;
    }

    toast.success(course.isPublished ? "Course unpublished" : "Course published");
    setCourses(prev =>
      prev.map(c => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
    );
  };

  const filteredCourses = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return courses;
    return courses.filter(course =>
      course.title.toLowerCase().includes(keyword) ||
      course.instructor?.fullName.toLowerCase().includes(keyword)
    );
  }, [courses, search]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="font-medium">Loading courses...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Courses
        </h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64 md:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." />
          </div>
          <Link
            href="/admin/courses/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Create course</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const gradient = gradients[index % gradients.length];
          return (
            <div
              key={course.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div
                className="h-32 sm:h-40 flex items-center justify-center p-6 text-white text-lg sm:text-xl font-bold text-center leading-tight"
                style={{ background: gradient }}
              >
                {course.title}
              </div>

              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">{course.instructor?.fullName ?? "No instructor"}</p>
                
                <div className="flex items-center justify-between mt-auto mb-6">
                  <span className="text-lg font-bold text-indigo-600">
                    {course.price === 0 ? "Free" : course.price.toLocaleString("vi-VN") + "đ"}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-lg ${
                      course.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => togglePublish(course)}
                    className="flex-1 py-2.5 text-xs sm:text-sm font-bold border-2 border-gray-50 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-gray-900 text-white rounded-xl text-center hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 mt-6">
          <p className="text-gray-400 font-medium italic">No courses match your search criteria.</p>
        </div>
      )}
    </div>
  );
}