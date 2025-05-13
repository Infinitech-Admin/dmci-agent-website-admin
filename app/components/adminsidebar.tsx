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
    LuLayoutList,
    LuLogOut,
    LuDownload,
    LuStar,
    LuVideo,
    LuPenLine,
    LuMailQuestion,
    LuCalendarClock,
} from 'react-icons/lu';
import { FiMenu } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import dmcilogo from './image/DMCI2019.png';
import { logoutUser } from '../utility/logut';
import useSWR from 'swr';
import { getAuthHeaders } from '@/app/utility/auth';
import { destroyCookie } from 'nookies'
import NavbarAvatar from './navbar-avatar';

interface AdminSidebarProps {
    pathname: string;
}

const fetcherWithAuth = async (url: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(url, {
        method: 'GET',
        headers: headers,
    });
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
        setSidebarOpen(false); // Close sidebar on navigation
        router.push(url);
    };

    useEffect(() => {
        if (loadingPath === pathname) {
            setLoadingPath(null); 
        }
    }, [pathname, loadingPath]);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LuLayoutDashboard className="h-5 w-5 mr-2" /> },
        { name: 'Properties', path: '/admin/properties', icon: <LuBuilding2 className="h-5 w-5 mr-2" /> },
        // { name: 'Listings', path: '/admin/listings', icon: <LuLayoutList className="h-5 w-5 mr-2" /> },
        { name: 'Schedules', path: '/admin/schedules', icon: <LuCalendarCheck className="h-5 w-5 mr-2" /> },
        { name: 'Applications', path: '/admin/applications', icon: <LuNetwork className="h-5 w-5 mr-2" /> },
        // { name: 'Room Planners', path: '/admin/planner', icon: <LuLayout className="h-5 w-5 mr-2" /> },
        { name: 'FAQs', path: '/admin/faqs', icon: <LuFileQuestion className="h-5 w-5 mr-2" /> },
        { name: 'News & Updates', path: '/admin/news', icon: <LuNewspaper className="h-5 w-5 mr-2" /> },
        { name: 'Testimonials', path: '/admin/testimonials', icon: <LuStar className="h-5 w-5 mr-2" /> },
        { name: 'Videos', path: '/admin/videos', icon: <LuVideo className="h-5 w-5 mr-2" /> },
        { name: 'Contracts', path: '/admin/contracts', icon: <LuPenLine className="h-5 w-5 mr-2" /> },
        { name: 'Inquiries', path: '/admin/inquiries', icon: <LuMailQuestion className="h-5 w-5 mr-2" /> },
        // { name: 'Appointments', path: '/admin/appointments', icon: <LuCalendarClock className="h-5 w-5 mr-2" /> },
        { name: 'Download', path: '/admin/download', icon: <LuDownload className="h-5 w-5 mr-2" />, },
        { name: 'Settings', path: '/admin/settings', icon: <LuSettings className="h-5 w-5 mr-2" /> },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('profile_id');
        sessionStorage.removeItem('user_id');

        destroyCookie(null, 'token');

        console.log('User logged out successfully.');

        window.location.href = '/auth/login';
    };

    return (
        <>
            {/* Hamburger menu for mobile */}
            <div className="flex sm:hidden pt-4 pl-4 pr-4 bg-gray-100">
                <div className="items-center justify-between w-full p-2 bg-white shadow rounded-lg">
                    <div className="flex">
                        <button
                            className="text-2xl p-2 focus:outline-none"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <AiOutlineClose /> : <FiMenu />}
                        </button>
                        {/* <Image src={dmcilogo} alt="DMCI LOGO" width={150} height={50} className="object-cover" /> */}
                    </div>
                    <div>
                        {/* <NavbarAvatar /> */}
                    </div>
                </div>
            </div>


            {/* Sidebar */}
            <aside
                className={`fixed lg:relative top-0 left-0 h-full bg-white shadow-sm flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-4 text-xl font-semibold text-center">
                    <Image src={dmcilogo} alt="DMCI LOGO" width={250} height={100} className="object-cover" />
                </div>

                <nav className="flex-1 p-4">
                    <ul className="menu p-0 flex-grow space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`flex items-center justify-between w-full p-2 rounded ${pathname === item.path
                                        ? 'bg-blue-700 text-white'
                                        : 'hover:bg-blue-700 hover:text-white'
                                        }`}
                                >
                                    <div className="flex">
                                        {item.icon}
                                        <span className="text-md ml-2">{item.name}</span>
                                    </div>
                                </button>
                            </li>
                        ))}

                        <li
                            className="p-2 rounded hover:bg-blue-700 hover:text-white"
                            onClick={handleLogout}
                        >
                            <button className="flex items-center w-full">
                                <LuLogOut className="h-5 w-5 mr-2" />
                                <span className="text-md">Log out</span>
                            </button>
                        </li>

                    </ul>
                </nav>
            </aside >

            {/* Overlay for mobile */}
            {
                isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )
            }
        </>
    );
};

export default AdminSidebar;