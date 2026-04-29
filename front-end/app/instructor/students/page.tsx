"use client";

import { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "sonner";
import Cookies from "js-cookie";
import Link from "next/link";
import { Search, Mail, UserCircle, GraduationCap, Loader2, Users } from "lucide-react";

interface Student {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    const token = Cookies.get("accessToken");
    try {
      const res = await fetch("http://localhost:8000/users?role=student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setStudents(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error("Failed to load student list");
      }
    } catch (error) {
      toast.error("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium italic text-sm md:text-base">Loading student directory...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-h-screen">
      <Toaster position="top-right" richColors />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 md:mb-12">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Users size={24} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">Student Management</h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium italic">Manage and track student information within the Edurio system.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search name or email..." 
            className="w-full pl-12 pr-4 py-3.5 md:py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 transition-all shadow-xl shadow-gray-100/50 text-sm font-medium" 
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {filteredStudents.map((student) => (
          <div key={student.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-indigo-100/30 hover:shadow-indigo-200/50 transition-all duration-300 p-6 md:p-8 flex flex-col relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500" />

            <div className="flex items-center gap-4 mb-6 relative">
              <div className="relative">
                {student.avatar ? (
                  <img 
                    src={`http://localhost:8000/${student.avatar}`} 
                    alt="avatar" 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/user.png"; }}
                  />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-white shadow-lg">
                    <UserCircle className="text-indigo-400" size={32} />
                  </div>
                )}
                {/* Đã loại bỏ chấm xanh ở đây */}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-gray-900 text-base md:text-lg truncate group-hover:text-indigo-600 transition-colors">
                  {student.fullName}
                </h3>
                {/* <span className="text-[9px] md:text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                  Active Student
                </span> */}
              </div>
            </div>

            <div className="space-y-3 mb-8 relative">
              <div className="flex items-center gap-3 text-gray-500 hover:text-gray-800 transition-colors">
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <Mail size={14} className="text-indigo-400" />
                </div>
                <span className="text-xs md:text-sm font-bold truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 hover:text-gray-800 transition-colors">
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <GraduationCap size={14} className="text-indigo-400" />
                </div>
                <span className="text-xs md:text-sm font-bold uppercase tracking-tighter">ID: #{student.id}</span>
              </div>
            </div>

            <Link 
              href={`/instructor/students/${student.id}`}
              className="mt-auto w-full py-3.5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all duration-300 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              View Student File
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
          <div className="p-6 bg-slate-50 rounded-full mb-4">
            <Search size={48} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">No results found</h3>
          <p className="text-gray-400 font-medium italic text-sm">We couldn't find any students matching "{search}"</p>
          <button 
            onClick={() => setSearch("")}
            className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">EduRio Academic Directory v2.0</p>
      </div>
    </div>
  );
}