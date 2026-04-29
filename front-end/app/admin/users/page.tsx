"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { Trash2, UserPlus, Shield, User, Mail, MoreVertical } from "lucide-react";
import Cookies from "js-cookie";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("accessToken");
      const res = await fetch("http://localhost:8000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.data ?? []);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (selectedUserId === null) return;
    try {
      const token = Cookies.get("accessToken");
      const res = await fetch(`http://localhost:8000/users/${selectedUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed");
      }

      toast.success("User deleted successfully");
      setShowConfirm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage system users and their roles.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
          </div>
          <Link href="/admin/users/create-instructor" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm active:scale-95">
            <UserPlus size={18} /> <span className="whitespace-nowrap">Create Instructor</span>
          </Link>
        </div>
      </div>

      {/* Desktop Table: Hiện từ màn hình md trở lên */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4 text-center w-16">#</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((u, idx) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition group">
                <td className="px-6 py-4 text-gray-400 text-center text-sm">{idx + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{u.fullName}</td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-6 py-4 text-center">
                  {u.role !== "ADMIN" && (
                    <button 
                      onClick={() => { setSelectedUserId(u.id); setShowConfirm(true); }} 
                      className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List: Hiện trên màn hình sm và nhỏ hơn */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  {u.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{u.fullName}</h3>
                  <RoleBadge role={u.role} />
                </div>
              </div>
              {u.role !== "ADMIN" && (
                <button 
                  onClick={() => { setSelectedUserId(u.id); setShowConfirm(true); }}
                  className="p-2 text-red-500 bg-red-50 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-50">
              <Mail size={14} />
              {u.email}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="p-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed">
          No users found in the system.
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] sm:rounded-2xl w-full max-w-[400px] p-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Delete User?</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              This action cannot be undone. All data associated with this user will be removed.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="order-2 sm:order-1 px-5 py-3 sm:py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold sm:font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="order-1 sm:order-2 px-5 py-3 sm:py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold sm:font-medium transition shadow-lg shadow-red-100"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component phụ để tái sử dụng Badge Role
function RoleBadge({ role }: { role: string }) {
  const styles = 
    role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 
    role === 'INSTRUCTOR' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles}`}>
      {role === 'ADMIN' ? <Shield size={12}/> : <User size={12}/>}
      {role}
    </span>
  );
}