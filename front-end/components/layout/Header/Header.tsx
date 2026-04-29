"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import MobileSidebar from "../Slidebars/MobileSidebar";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadProfile = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) return;
      const res = await fetch("http://localhost:8000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to load header profile");
    }
  };

  const handleLogout = () => {
    Cookies.remove("accessToken", { path: "/" });
    localStorage.clear();
    router.push("/login");
  };

  useEffect(() => {
    loadProfile();
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full h-[80px] lg:h-[150px] bg-[#F6F7F9] flex z-50 items-center border-b">
      <div className="flex lg:hidden px-4">
        <button 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileNavOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className="hidden lg:flex w-[290px] bg-white h-full items-center justify-center border-r">
        <img src="/img/logo.png" alt="Logo" className="w-[220px]" />
      </div>
      <div className="lg:hidden flex items-center px-2">
        <img src="/img/logo.png" alt="Logo" className="w-[120px]" />
      </div>

      <div className="flex-1 flex items-center px-4 lg:px-8">
        <h1 className="text-sm md:text-xl lg:text-3xl font-bold text-black tracking-tight uppercase line-clamp-1">
          Learning Management System
        </h1>
      </div>

      <div className="flex items-center gap-6 pr-4 lg:pr-10 relative" ref={menuRef}>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase">{user.role}</p>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 group">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-white group-hover:border-blue-500 transition-all">
                {user.avatar ? (
                  <img src={`http://localhost:8000/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">{user.fullName?.charAt(0)}</div>
                )}
              </div>
              <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[110%] w-56 bg-white rounded-2xl shadow-2xl border py-2 z-[60]">
                <Link href={`/${user.role?.toLowerCase()}/profile`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} /> My Profile
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"><Button className="bg-black text-white">Sign In</Button></Link>
        )}
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <img src="/img/logo.png" alt="Logo" className="w-32" />
              <button onClick={() => setIsMobileNavOpen(false)}><X size={24} /></button>
            </div>
            <MobileSidebar role={user?.role?.toLowerCase() || "student"} onClose={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;