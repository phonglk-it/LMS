import Header from "@/components/layout/Header/Header";
import Slidebars from "@/components/layout/Slidebars/Slidebars";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Header />

      <div className="flex pt-[80px] lg:pt-[150px]">
        <Slidebars role="instructor" />

        <main className="ml-0 lg:ml-[290px] w-full min-h-screen bg-[#F6F7F9] p-4 md:p-6 lg:p-10 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}