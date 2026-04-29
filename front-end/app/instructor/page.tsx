"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import { 
  Users, 
  BookOpen, 
  FileVideo, 
  RefreshCcw, 
  TrendingUp, 
  PlayCircle,
  Clock,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function InstructorDashboard() {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalInstructors: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("accessToken");
      
      // Gọi đúng endpoint bạn vừa thêm Role Instructor
      const response = await axios.get('http://localhost:8000/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setStatsData({
          totalStudents: response.data.totalStudents || 0,
          totalCourses: response.data.totalCourses || 0,
          totalLessons: response.data.totalLessons || 0,
          totalInstructors: response.data.totalInstructors || 0,
        });
      }
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Ánh xạ dữ liệu vào các thẻ Card
  const cards = [
    { title: 'Total Students', value: statsData.totalStudents, icon: Users, color: 'bg-indigo-500' },
    { title: 'Total Courses', value: statsData.totalCourses, icon: BookOpen, color: 'bg-rose-500' },
    { title: 'Total Lessons', value: statsData.totalLessons, icon: FileVideo, color: 'bg-amber-500' },
    { title: 'Instructors', value: statsData.totalInstructors, icon: ShieldCheck, color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-600 rounded-lg text-white shadow-lg">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Instructor DashBoard</h1>
          </div>
          <p className="text-slate-500 font-medium italic text-xs md:text-sm">System-wide statistics for Edurio Educators</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
           <button 
             onClick={fetchStats} 
             disabled={loading}
             className="p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:text-rose-600 transition-all active:scale-90 group"
           >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
           </button>
           <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-slate-200">
              <PlayCircle className="text-rose-400" size={18} />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest">Platform Live</span>
           </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-100/50 flex flex-col justify-between group hover:border-rose-100 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} p-3 md:p-4 rounded-2xl text-white shadow-xl shadow-current/20 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-none">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-200 inline-block" size={24} />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </h3>
              </div>
            </div>
            <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden mt-4">
              <div 
                className={`h-full ${card.color} transition-all duration-1000`} 
                style={{ width: loading ? '0%' : '70%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Analytics Box */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 min-h-[400px] flex flex-col relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative">
            <h3 className="font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-8 flex items-center gap-2">
              <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
              System Engagement
            </h3>
            
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/50 py-20 px-6 text-center">
               <div className="p-4 bg-white rounded-full shadow-md mb-4 text-rose-500">
                  <TrendingUp size={32} />
               </div>
               <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-1">Database Connected</p>
               <p className="text-slate-400 font-medium italic text-sm">System-wide activity monitoring is active</p>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6 md:space-y-8 flex flex-col">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 flex-1 relative overflow-hidden">
             <Clock className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-5" />
             
             <h3 className="font-black uppercase text-xs tracking-widest text-rose-400 mb-8">Server Status</h3>
             
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port 8000</p>
                    <span className="text-lg font-black block tracking-tighter">Online</span>
                  </div>
                </div>

                <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Access Level</p>
                   <div className="flex justify-between items-end">
                      <span className="text-xl font-black italic text-rose-100">Instructor</span>
                      <span className="text-[10px] font-bold text-rose-400 underline">VERIFIED</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-center py-8">
             <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.3em]">
               EduRio Hub v2.0
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}