"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Instructor {
  id: number;
  fullName: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) return;
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:8000/users?role=INSTRUCTOR", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setInstructors(data.data ?? []);
      } catch {
        toast.error("Failed to load instructors");
      } finally {
        setLoadingInstructors(false);
      }
    };
    fetchInstructors();
  }, [token]);

  const submit = async () => {
    if (!token) return toast.error("Unauthorized");
    if (!title.trim()) return toast.error("Title is required");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price: Number(price), instructorId: instructorId ?? undefined }),
      });

      if (!res.ok) throw new Error();
      toast.success("Course created successfully!");
      router.push("/admin/courses");
    } catch {
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Create New Course</h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base"
              placeholder="e.g. NextJS for Beginners"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base"
              placeholder="Tell us about the course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                value={instructorId ?? ""}
                onChange={(e) => setInstructorId(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingInstructors}
              >
                <option value="">{loadingInstructors ? "Loading..." : "Select instructor"}</option>
                {instructors.map((ins) => (
                  <option key={ins.id} value={ins.id}>{ins.fullName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}