
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BedDouble, User, ShieldCheck, LogOut, Hotel, CalendarCheck, ClipboardCheck, FileText, Settings } from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
        { to: '/rooms', icon: BedDouble, label: 'Room Management' },
        { to: '/customers', icon: User, label: 'Customer List' },
        { to: '/tm30', icon: ClipboardCheck, label: 'TM.30 Verification' },
        { to: '/reports', icon: FileText, label: 'Gov Reports' },
        { to: '/roles', icon: ShieldCheck, label: 'Roles & Permissions' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-200 hover:bg-blue-700 hover:text-white'
        }`;

    return (
        <div className="w-64 bg-blue-800 text-white flex flex-col flex-shrink-0">
            <div className="flex items-center justify-center h-20 border-b border-blue-700">
                <Hotel className="h-8 w-8 mr-3 text-blue-300" />
                <h1 className="text-2xl font-bold tracking-wider">HOTEL</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 py-6 mt-auto">
                 <button onClick={onLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-200 hover:bg-blue-700 hover:text-white transition-colors duration-200">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;