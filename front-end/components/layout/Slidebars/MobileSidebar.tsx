"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Mail,
  Library
} from "lucide-react";

export default function MobileSidebar({ role, onClose }: any) {
  const pathname = usePathname();

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
    { label: "Dashboard", icon: LayoutDashboard, href: "/student" },
    { label: "Courses", icon: Library, href: "/student/all-courses" },
    { label: "My Courses", icon: BookOpen, href: "/student/courses" },
    { label: "Messages", icon: Mail, href: "/student/messages" },
  ];

  const menu =
    role === "admin"
      ? adminMenu
      : role === "instructor"
      ? instructorMenu
      : studentMenu;

  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-4 flex flex-col gap-2">
        {menu.map((item: any) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}