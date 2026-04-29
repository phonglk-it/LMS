"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Camera, Mail, Shield, User as UserIcon, Lock, Loader2 } from "lucide-react";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  avatar: string | null;
}

export default function InstructorUserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) return;

      const res = await fetch("http://localhost:8000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setUser(data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!avatarFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      const token = Cookies.get("accessToken");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch("http://localhost:8000/users/upload-avatar", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Avatar updated successfully");
      setAvatarFile(null);
      setPreviewUrl(null);
      await loadProfile();
      window.dispatchEvent(new Event("storage"));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium italic">Loading your profile...</p>
    </div>
  );

  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">My Profile</h2>
        <p className="text-gray-500 text-xs md:text-base italic font-medium">Manage your personal information and account security.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side: Avatar Section */}
          <div className="w-full lg:w-1/3 bg-slate-50/50 p-6 md:p-10 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="relative group">
              <div className="w-32 h-32 md:w-52 md:h-52 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <img
                  src={previewUrl || (user.avatar ? `http://localhost:8000/${user.avatar}` : "/user.png")}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/user.png"; }}
                />
              </div>
              
              <label className="absolute bottom-1 right-1 md:bottom-4 md:right-4 p-2.5 md:p-3 bg-blue-600 text-white rounded-xl md:rounded-2xl cursor-pointer hover:bg-blue-700 shadow-xl hover:rotate-6 transition-all duration-300">
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
                <input type="file" hidden accept="image/*" onChange={onFileChange} />
              </label>
            </div>
            
            <div className="mt-6 md:mt-8 w-full space-y-4 text-center">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs md:text-sm font-bold text-gray-600 italic px-2 truncate">
                  {avatarFile ? `Ready: ${avatarFile.name}` : "Profile Picture Active"}
                </p>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!avatarFile || uploading}
                className="w-full py-3.5 md:py-4 px-6 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
              >
                {uploading ? "Processing..." : "Update Avatar"}
              </button>

              {avatarFile && !uploading && (
                <button 
                  onClick={() => {setAvatarFile(null); setPreviewUrl(null);}}
                  className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Info Section */}
          <div className="w-full lg:w-2/3 p-6 md:p-10 space-y-4 md:space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 md:mb-4">Account Details</h3>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {/* Full Name */}
              <div className="group flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800 truncate">{user.fullName}</p>
                </div>
              </div>

              {/* Email */}
              <div className="group flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800 truncate">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="group flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Shield className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider">Account Role</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm md:text-lg font-bold text-gray-800 uppercase tracking-tighter">{user.role}</p>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] md:text-[10px] font-black rounded-md">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="pt-4 md:pt-6">
              <button
                onClick={() => window.location.href = `/${user.role.toLowerCase()}/profile/change-password`}
                className="flex items-center justify-center gap-3 w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase text-[11px] md:text-sm hover:bg-slate-800 transform active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                <Lock className="w-4 h-4 md:w-5 md:h-5" />
                Change Password
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">EduRio Security Protocol v2.0</p>
      </div>
    </div>
  );
}