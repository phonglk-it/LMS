"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      await axios.patch(
        "http://localhost:8000/users/change-password",
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-6 transition-colors group text-xs md:text-sm"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO PROFILE
      </button>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/50">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="bg-indigo-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-200 shrink-0 w-fit">
            {/* Fix lỗi size: Dùng class thay cho prop md:size */}
            <Lock className="w-[28px] h-[28px] md:w-[32px] md:h-[32px]" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Security Update</h3>
            <p className="text-gray-500 font-medium italic text-xs md:text-sm leading-tight">Update your password to keep your account safe.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {[
            { id: "currentPassword", label: "Current Password", placeholder: "••••••••" },
            { id: "newPassword", label: "New Password", placeholder: "Min 6 characters" },
            { id: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                {field.label}
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={(formData as any)[field.id]}
                  placeholder={field.placeholder}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300 text-sm md:text-base"
                  required
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-[10px] md:text-xs font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition"
            >
              {showPassword ? (
                <EyeOff className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
              ) : (
                <Eye className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
              )}
              {showPassword ? "Hide text" : "Show text"}
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-sm shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                  Updating...
                </>
              ) : (
                "Save New Password"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 md:mt-10 flex items-center justify-center gap-2 text-gray-400">
        <div className="h-px w-6 md:w-8 bg-gray-200"></div>
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</p>
        <div className="h-px w-6 md:w-8 bg-gray-200"></div>
      </div>
    </div>
  );
}