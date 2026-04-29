"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateInstructorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/users/instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      
      toast.success("Instructor created successfully");
      router.push("/admin/users");
    } catch {
      toast.error("Failed to create instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8 min-h-screen flex flex-col justify-center sm:block">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        <span>Back to users</span>
      </button>

      {/* Điều chỉnh padding card: p-6 trên mobile, p-8 trên desktop */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 w-fit">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Instructor</h1>
            <p className="text-sm text-gray-500">Fill in the details to add a new instructor.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition text-base"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3.5 font-bold transition flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Create Instructor"
          )}
        </button>
      </div>
    </div>
  );
}