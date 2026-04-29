"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft, Mail, BookOpen, Calendar, User, Loader2, ShieldCheck } from "lucide-react";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      if (!id) return;
      const token = Cookies.get("accessToken");
      try {
        const res = await fetch(`http://localhost:8000/users/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student details");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetail();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium italic text-sm">Fetching student information...</p>
    </div>
  );

  if (!student) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 font-bold">Student not found.</p>
      <button onClick={() => router.back()} className="text-blue-600 underline mt-4">Go back</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-h-screen">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 md:mb-8 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        BACK TO LIST
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/40 flex flex-col items-center self-start">
          {/* Avatar Section */}
          <div className="relative group mb-6">
            <div className="w-32 h-32 md:w-44 md:h-44 bg-slate-50 rounded-full flex items-center justify-center border-4 md:border-8 border-white shadow-xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
              {student.avatar ? (
                <img 
                  src={`http://localhost:8000/${student.avatar}`} 
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/user.png"; }}
                />
              ) : (
                <User size={64} className="text-slate-300" />
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
              <ShieldCheck size={16} />
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
              {student.fullName}
            </h2>
            <p className="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full inline-block tracking-[0.2em]">
              STUDENT
            </p>
          </div>

          <div className="w-full mt-8 md:mt-10 space-y-3 md:space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-500">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest">Email Address</p>
                <p className="text-xs md:text-sm text-gray-900 font-bold truncate">{student.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-500">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest">Student ID</p>
                <p className="text-xs md:text-sm text-gray-900 font-bold">#{student.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/40 h-full">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                Enrolled Courses
              </h3>
              <span className="text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                {student.enrollments?.length || 0} Total
              </span>
            </div>
            
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.enrollments.map((item: any) => (
                  <div key={item.id} className="group flex flex-col p-5 border-2 border-gray-50 rounded-[1.5rem] hover:border-indigo-500/20 hover:bg-indigo-50/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        {item.course.title.charAt(0)}
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-widest uppercase">
                        Active
                      </span>
                    </div>
                    <h4 className="font-black text-gray-800 text-sm md:text-base leading-tight group-hover:text-indigo-600 transition-colors">
                      {item.course.title}
                    </h4>
                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      Access Granted
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-gray-200">
                <BookOpen size={40} className="text-slate-200 mb-4" />
                <p className="text-gray-400 font-medium italic text-sm">No courses enrolled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}