
import { Toaster } from "react-hot-toast";
import AdminAuth from "@/app/components/adminauth";
import SidebarWrapper from "../components/sidebarwrappper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuth>
            <section className="flex min-h-screen">
                {/* Sidebar */}
                <div className="w-64 sm:w-72 fixed top-0 left-0 h-full bg-white shadow-lg z-50">
                    <SidebarWrapper />
                </div>

                {/* Main Content */}
                <main className="flex-1 ml-64 sm:ml-72 p-4 sm:p-8 bg-gray-100 overflow-y-auto">
                    {/* Toaster for notifications */}
                    <Toaster position="bottom-right" reverseOrder={false} />
                    <div className="max-w-full">{children}</div>
                </main>
            </section>
        </AdminAuth>
    );
}
