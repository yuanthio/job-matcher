import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NavbarDashboard from "@/components/NavbarDashboard";
import UploadCVCard from "@/components/UploadCvCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavbarDashboard />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            Welcome back!
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Hello, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-600">
            Upload your CV to get personalized job recommendations or search for specific roles.
          </p>
        </div>
        <UploadCVCard />
      </main>
    </div>
  );
}