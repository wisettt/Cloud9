import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Table from './ui/Table';
import { useData } from '../contexts/DataContext';
import { Customer, PaymentStatus, BookingStatus } from '../types';
import { Hotel, BedDouble, Bed, LogIn, LogOut, Eye } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

// Flattened type for display
interface FlatBookingRow {
    id: string; // unique row id
    originalBooking: Customer;
    roomNumber: string;
    bookingStatus: BookingStatus;
}

const Dashboard: React.FC = () => {
    const { stats, customers } = useData();
    const navigate = useNavigate();

    const handleViewDetails = (customer: Customer) => {
        navigate('/bookings', { state: { openBookingId: customer.bookingId } });
    };
    
    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const statusClasses = {
            Paid: "bg-green-100 text-green-800",
            Pending: "bg-yellow-100 text-yellow-800",
            "Deposit Paid": "bg-blue-100 text-blue-800",
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const recentCheckIns: FlatBookingRow[] = customers
        .flatMap(c => c.roomStays.map(rs => ({ 
            id: `${c.id}-${rs.roomNumber}`,
            originalBooking: c, 
            roomNumber: rs.roomNumber, 
            bookingStatus: rs.bookingStatus 
        })))
        .filter(flatBooking => flatBooking.bookingStatus === BookingStatus.CheckedIn)
        .sort((a, b) => new Date(b.originalBooking.checkInDate).getTime() - new Date(a.originalBooking.checkInDate).getTime())
        .slice(0, 5);
        
    const todaysCheckOutsList: FlatBookingRow[] = customers
        .filter(c => c.checkOutDate === todayStr)
        .flatMap(c => c.roomStays.map(rs => ({ 
            id: `${c.id}-${rs.roomNumber}`,
            originalBooking: c, 
            roomNumber: rs.roomNumber, 
            bookingStatus: rs.bookingStatus 
        })));


    const checkInColumns = [
        { header: 'Guest Name', accessor: (item: FlatBookingRow) => item.originalBooking.fullName },
        { header: 'Room Number', accessor: 'roomNumber' as keyof FlatBookingRow },
        { header: 'Check-In Date', accessor: (item: FlatBookingRow) => formatDateToDDMMYYYY(item.originalBooking.checkInDate) },
        { header: 'Payment Status', accessor: (item: FlatBookingRow) => getPaymentStatusBadge(item.originalBooking.paymentStatus) },
    ];

    const checkOutColumns = [
        { header: 'Guest Name', accessor: (item: FlatBookingRow) => item.originalBooking.fullName },
        { header: 'Room Number', accessor: 'roomNumber' as keyof FlatBookingRow },
        { header: 'Check-Out Date', accessor: (item: FlatBookingRow) => formatDateToDDMMYYYY(item.originalBooking.checkOutDate) },
        { header: 'Payment Status', accessor: (item: FlatBookingRow) => getPaymentStatusBadge(item.originalBooking.paymentStatus) },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card title="Total Rooms" value={stats.totalRooms} icon={Hotel} color="#3B82F6" />
                <Card title="Available Rooms" value={stats.availableRooms} icon={BedDouble} color="#10B981" />
                <Card title="Booked Rooms" value={stats.bookedRooms} icon={Bed} color="#8B5CF6" />
                <Card title="Today's Check-Ins" value={stats.todaysCheckIns} icon={LogIn} color="#F59E0B" />
                <Card title="Today's Check-Outs" value={stats.todaysCheckOuts} icon={LogOut} color="#EF4444" />
            </div>

            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Check-Ins</h2>
                     <Table<FlatBookingRow>
                        columns={checkInColumns}
                        data={recentCheckIns}
                        isScrollable={false}
                        renderRowActions={(row) => (
                            <button
                                onClick={() => handleViewDetails(row.originalBooking)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                title="View Details"
                            >
                                <Eye size={16} />
                                View
                            </button>
                        )}
                     />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Today's Check-Outs</h2>
                     <Table<FlatBookingRow>
                        columns={checkOutColumns}
                        data={todaysCheckOutsList}
                        isScrollable={false}
                        renderRowActions={(row) => (
                            <button
                                onClick={() => handleViewDetails(row.originalBooking)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                title="View Details"
                            >
                                <Eye size={16} />
                                View
                            </button>
                        )}
                     />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;