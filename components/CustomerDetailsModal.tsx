
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';
import { Customer, Gender, BookingStatus } from '../types';
import DoubleClickEditableField from './ui/DoubleClickEditableField';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import { Edit, Printer } from 'lucide-react';

// This is the type passed from CustomerList
interface UniqueCustomer {
    latestCustomerRecord: Customer;
}

interface CustomerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: UniqueCustomer | null;
    onUpdateCustomer: (updatedRecord: Customer) => void;
    allCustomers: Customer[];
}

const nationalities = ['American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Japanese', 'Chinese'];
const genders: Gender[] = ['Male', 'Female', 'Other'];

const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
};

const generateAvatarColors = (name: string): { backgroundColor: string; textColor: string } => {
    if (!name) return { backgroundColor: '#e5e7eb', textColor: '#4b5563' }; // gray-200, gray-600

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colorPairs = [
        { bg: '#fecaca', text: '#991b1b' }, // red
        { bg: '#fed7aa', text: '#9a3412' }, // orange
        { bg: '#fde68a', text: '#92400e' }, // amber
        { bg: '#d9f99d', text: '#3f6212' }, // lime
        { bg: '#bfdbfe', text: '#1e40af' }, // blue
        { bg: '#e9d5ff', text: '#5b21b6' }, // purple
        { bg: '#fbcfe8', text: '#9d174d' }, // pink
    ];

    const index = Math.abs(hash % colorPairs.length);
    return {
        backgroundColor: colorPairs[index].bg,
        textColor: colorPairs[index].text,
    };
};


const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-gray-700">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);


const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customerProfile, onUpdateCustomer, allCustomers }) => {
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState<Customer | null>(customerProfile?.latestCustomerRecord ?? null);

    useEffect(() => {
        setCustomerData(customerProfile?.latestCustomerRecord ?? null);
    }, [customerProfile]);

    const bookingHistory = useMemo(() => {
        if (!customerData) return [];
        return allCustomers
            .filter(c => c.email === customerData.email)
            .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
    }, [allCustomers, customerData]);

    const handleSave = (field: keyof Customer, value: any) => {
        if (customerData) {
            const updatedCustomer = { ...customerData, [field]: value };
            setCustomerData(updatedCustomer);
            onUpdateCustomer(updatedCustomer);
        }
    };
    
    const getStatusBadge = (status: BookingStatus) => {
        const statusClasses: { [key in BookingStatus]: string } = {
            [BookingStatus.Confirmed]: "bg-blue-100 text-blue-800",
            [BookingStatus.CheckedIn]: "bg-green-100 text-green-800",
            [BookingStatus.Pending]: "bg-gray-100 text-gray-800",
            [BookingStatus.CheckedOut]: "bg-gray-100 text-gray-800",
            [BookingStatus.Cancelled]: "bg-red-100 text-red-800",
        };
        const statusStyles = statusClasses[status] || "bg-gray-200 text-gray-800";
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles}`}>{status}</span>;
    };

    if (!customerData) return null;

    const avatarColors = generateAvatarColors(customerData.fullName);

    const modalTitle = (
        <div className="flex justify-between items-center w-full">
            <span>Guest Profile</span>
            <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors" title="Edit Profile">
                    <Edit size={18} />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors" title="Print Registration">
                    <Printer size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <div className="space-y-6">
                <Section title="Personal Information (ข้อมูลส่วนตัว)">
                    <div className="flex items-start gap-6">
                        <button
                            className="relative group w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            style={{ backgroundColor: avatarColors.backgroundColor }}
                            title="Upload / Change Photo"
                        >
                            <span className="text-4xl font-bold" style={{ color: avatarColors.textColor }}>
                                {getInitials(customerData.fullName)}
                            </span>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Upload</span>
                            </div>
                        </button>
                        <div className="flex-1">
                            <dl className="divide-y divide-gray-200">
                                <DetailItem label="Name and Surname">
                                    <DoubleClickEditableField label="Name and Surname" initialValue={customerData.fullName} onSave={(val) => handleSave('fullName', val)} />
                                </DetailItem>
                                <DetailItem label="Email">
                                    <DoubleClickEditableField label="Email" type="email" initialValue={customerData.email} onSave={(val) => handleSave('email', val)} />
                                </DetailItem>
                                <DetailItem label="Phone Number">
                                    <DoubleClickEditableField label="Phone Number" initialValue={customerData.phone} onSave={(val) => handleSave('phone', val)} />
                                </DetailItem>
                            </dl>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                         <dl className="divide-y divide-gray-200">
                             <DetailItem label="Passport No.">
                                <DoubleClickEditableField label="Passport No." initialValue={customerData.passportId} onSave={(val) => handleSave('passportId', val)} />
                            </DetailItem>
                            <DetailItem label="Nationality">
                                <DoubleClickEditableField label="Nationality" type="select" initialValue={customerData.nationality} options={nationalities} onSave={(val) => handleSave('nationality', val)} />
                            </DetailItem>
                             <DetailItem label="Date of Birth">
                                <DoubleClickEditableField label="Date of Birth" type="date" initialValue={customerData.dob} onSave={(val) => handleSave('dob', val)} />
                            </DetailItem>
                            <DetailItem label="Gender">
                                <DoubleClickEditableField label="Gender" type="select" initialValue={customerData.gender} options={genders} onSave={(val) => handleSave('gender', val)} />
                            </DetailItem>
                         </dl>
                    </div>
                </Section>
                
                <Section title="Booking History (ประวัติการเข้าพัก)">
                     <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50/50">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-gray-600">
                                <tr>
                                    <th className="p-3 font-medium">Booking ID</th>
                                    <th className="p-3 font-medium">Room No.</th>
                                    <th className="p-3 font-medium">Check-In</th>
                                    <th className="p-3 font-medium">Check-Out</th>
                                    <th className="p-3 font-medium">Guests</th>
                                    <th className="p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookingHistory.map(booking => (
                                    <tr key={booking.id} className="bg-white">
                                        <td className="p-3 text-gray-700">
                                             <button 
                                                onClick={() => {
                                                    onClose();
                                                    navigate('/bookings', { state: { openBookingId: booking.bookingId } });
                                                }}
                                                className="text-blue-600 hover:underline font-medium"
                                             >
                                                {booking.bookingId}
                                             </button>
                                        </td>
                                        <td className="p-3 text-gray-700">
                                            <button
                                                onClick={() => {
                                                    const roomCode = booking.roomStays[0]?.roomNumber;
                                                    if (roomCode) {
                                                        onClose();
                                                        navigate('/rooms', { state: { highlight: roomCode } });
                                                    }
                                                }}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {booking.roomStays.map(rs => rs.roomNumber).join(', ')}
                                            </button>
                                        </td>
                                        <td className="p-3 text-gray-700">{formatDateToDDMMYYYY(booking.checkInDate)}</td>
                                        <td className="p-3 text-gray-700">{formatDateToDDMMYYYY(booking.checkOutDate)}</td>
                                        <td className="p-3 text-gray-700">{`${booking.adults} Adult(s)`}{booking.children > 0 ? `, ${booking.children} Child(ren)` : ''}</td>
                                        <td className="p-3 text-gray-700">{getStatusBadge(booking.roomStays[0]?.bookingStatus || BookingStatus.Pending)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {bookingHistory.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No booking history found.</p>
                    )}
                </Section>
            </div>
        </Modal>
    );
};

export default CustomerDetailsModal;
