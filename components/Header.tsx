
import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
            <div className="relative">
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search bookings, customers..."
                    className="w-96 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex items-center space-x-6">
                <button className="relative text-gray-500 hover:text-blue-600">
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
                <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">Admin User</p>
                        <p className="text-xs text-gray-500">admin@horizon.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;