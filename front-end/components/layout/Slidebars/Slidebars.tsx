"use client";

import { LayoutDashboard, Users, BookOpen, Mail, Library } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface SidebarProps { role: "admin" | "instructor" | "student"; }

const adminMenu = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "User Management", icon: Users, href: "/admin/users" },
  { label: "Courses", icon: BookOpen, href: "/admin/courses" },
  { label: "Messages", icon: Mail, href: "/admin/messages" },
];

const instructorMenu = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/instructor" },
  { label: "My Courses", icon: BookOpen, href: "/instructor/courses" },
  { label: "Students", icon: Users, href: "/instructor/students" },
  { label: "Messages", icon: Mail, href: "/instructor/messages" },
];

const studentMenu = [
  // { label: "Dashboard", icon: LayoutDashboard, href: "/student" },
  { label: "Courses", icon: Library, href: "/student/all-courses" },
  { label: "My Courses", icon: BookOpen, href: "/student/courses" },
  { label: "Messages", icon: Mail, href: "/student/messages" },
];

export default function Sidebars({ role }: SidebarProps) {
  const pathname = usePathname();
  const menu = role === "admin" ? adminMenu : role === "instructor" ? instructorMenu : studentMenu;

  return (
    <aside className="hidden lg:flex w-[290px] h-[calc(100vh-150px)] fixed left-0 top-[150px] bg-white flex-col pt-6 border-r">
      <div className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium",
                active 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "hover:bg-gray-50 text-gray-600 hover:text-blue-600"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-50">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] text-center">
          EduRio LMS v2.0
        </p>
      </div>
    </aside>
  );
}