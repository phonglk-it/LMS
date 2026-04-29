"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Sử dụng px-4 để form không dính sát lề màn hình điện thoại
    <div className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <form 
        onSubmit={handleSubmit} 
        // Điều chỉnh padding (p-6 trên mobile, p-8 trên desktop) để tiết kiệm không gian
        className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Change Password</h3>
            <p className="text-xs sm:text-sm text-gray-500">Ensure your account is secure.</p>
          </div>
        </div>

        {[
          { id: "currentPassword", label: "Current Password" },
          { id: "newPassword", label: "New Password" },
          { id: "confirmPassword", label: "Confirm New Password" },
        ].map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={(formData as any)[field.id]}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                // Tăng padding dọc một chút (py-3.5) để dễ bấm hơn trên màn hình cảm ứng
                className="w-full border border-gray-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-indigo-600 transition font-medium"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPassword ? "Hide passwords" : "Show passwords"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 sm:py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span className="uppercase tracking-wider text-xs sm:text-sm">Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
}