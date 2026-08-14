'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LuLayoutDashboard,
    LuBuilding2,
    LuCalendarCheck,
    LuNetwork,
    LuFileQuestion,
    LuNewspaper,
    LuSettings,
    LuLogOut,
    LuDownload,
    LuStar,
    LuVideo,
    LuPenLine,
    LuMailQuestion,
} from 'react-icons/lu';
import { FiMenu } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import dmcilogo from './image/DMCI2019.png';
import useSWR from 'swr';
import { getAuthHeaders } from '@/app/utility/auth';
import { destroyCookie } from 'nookies';

interface AdminSidebarProps {
    pathname: string;
}

const fetcherWithAuth = async (url: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: 'GET', headers });
    return await res.json();
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ pathname }) => {
    const { data } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/get-counts`,
        fetcherWithAuth
    );
    const [loadingPath, setLoadingPath] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    const handleNavigation = (url: string) => {
        setLoadingPath(url);
        setSidebarOpen(false);
        router.push(url);
    };

    useEffect(() => {
        if (loadingPath === pathname) {
            setLoadingPath(null);
        }
    }, [pathname, loadingPath]);

    // Auto-close the drawer if the viewport grows into desktop size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LuLayoutDashboard className="h-5 w-5 shrink-0" /> },
        { name: 'Properties', path: '/admin/properties', icon: <LuBuilding2 className="h-5 w-5 shrink-0" /> },
        { name: 'Schedules', path: '/admin/schedules', icon: <LuCalendarCheck className="h-5 w-5 shrink-0" /> },
        { name: 'Applications', path: '/admin/applications', icon: <LuNetwork className="h-5 w-5 shrink-0" /> },
        { name: 'FAQs', path: '/admin/faqs', icon: <LuFileQuestion className="h-5 w-5 shrink-0" /> },
        { name: 'News & Updates', path: '/admin/news', icon: <LuNewspaper className="h-5 w-5 shrink-0" /> },
        { name: 'Testimonials', path: '/admin/testimonials', icon: <LuStar className="h-5 w-5 shrink-0" /> },
        { name: 'Videos', path: '/admin/videos', icon: <LuVideo className="h-5 w-5 shrink-0" /> },
        { name: 'Contracts', path: '/admin/contracts', icon: <LuPenLine className="h-5 w-5 shrink-0" /> },
        { name: 'Inquiries', path: '/admin/inquiries', icon: <LuMailQuestion className="h-5 w-5 shrink-0" /> },
        { name: 'Download', path: '/admin/download', icon: <LuDownload className="h-5 w-5 shrink-0" /> },
        { name: 'Settings', path: '/admin/settings', icon: <LuSettings className="h-5 w-5 shrink-0" /> },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('profile_id');
        sessionStorage.removeItem('user_id');
        destroyCookie(null, 'token');
        window.location.href = '/auth/login';
    };

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between bg-white shadow-sm px-4">
                <Image
                    src={dmcilogo}
                    alt="DMCI LOGO"
                    width={130}
                    height={50}
                    className="object-contain h-9 w-auto"
                />
                <button
                    className="p-2 text-2xl rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    {isSidebarOpen ? <AiOutlineClose /> : <FiMenu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-full lg:h-screen w-72 sm:w-80 lg:w-64 xl:w-72 shrink-0 bg-white shadow-sm flex flex-col transition-transform duration-300 z-50 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="p-4 text-xl font-semibold text-center hidden lg:block">
                    <Image
                        src={dmcilogo}
                        alt="DMCI LOGO"
                        width={250}
                        height={100}
                        className="object-contain w-full h-auto"
                    />
                </div>

                {/* Mobile-only header inside the drawer */}
                <div className="flex lg:hidden items-center justify-between p-4 border-b">
                    <Image
                        src={dmcilogo}
                        alt="DMCI LOGO"
                        width={150}
                        height={60}
                        className="object-contain h-10 w-auto"
                    />
                    <button
                        className="p-2 text-xl rounded-md hover:bg-gray-100"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <AiOutlineClose />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="menu p-0 flex-grow space-y-1 sm:space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`flex items-center w-full gap-2 p-2 rounded text-sm sm:text-[15px] transition-colors ${
                                        pathname === item.path
                                            ? 'bg-blue-700 text-white'
                                            : 'hover:bg-blue-700 hover:text-white'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="truncate">{item.name}</span>
                                </button>
                            </li>
                        ))}

                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full gap-2 p-2 rounded text-sm sm:text-[15px] hover:bg-blue-700 hover:text-white"
                            >
                                <LuLogOut className="h-5 w-5 shrink-0" />
                                <span>Log out</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
};

export default AdminSidebar;