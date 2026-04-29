"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import Link from "next/link"; // ✅ Thêm Link của Next.js

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      return toast.error("Missing information", { description: "Please enter your email and password" });
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data;

      Cookies.set("accessToken", accessToken, { expires: 1, sameSite: "lax" });
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Welcome back to EduRio!");

      const role = user.role.toLowerCase();
      setTimeout(() => {
        router.push(`/${role}`);
      }, 500);

    } catch (error: any) {
      toast.error("Login failed", {
        description: error.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to EduRio</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-10 h-12 rounded-xl border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pl-10 pr-10 h-12 rounded-xl border-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ✅ THÊM DÒNG NÀY ĐỂ QUÊN MẬT KHẨU */}
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-semibold shadow-md shadow-indigo-100" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}