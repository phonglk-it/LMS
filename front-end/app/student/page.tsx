"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header/Header";
import Slidebars from "@/components/layout/Slidebars/Slidebars";
import { Loader2 } from "lucide-react";

export default function StudentPage() {
  const router = useRouter();

  useEffect(() => {

    router.replace('/student/all-courses'); 
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Slidebars />
        <main className="flex-1 flex flex-col items-center justify-center p-10">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
            Moving on to the course...
          </p>
        </main>
      </div>
    </div>
  );
}