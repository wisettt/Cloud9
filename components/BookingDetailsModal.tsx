
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './ui/Modal';
import { Customer, Guest, PaymentStatus, VisaType, TM30Status, Gender, EmailStatus, GuestType, RoomStay, BookingStatus } from '../types';
import Button from './ui/Button';
import { useData } from '../contexts/DataContext';
import SendEmailModal from './ui/SendEmailModal';
import { PlusCircle, User, FileScan, Users, Mail, CheckCircle, Save, Calendar, Bed, Search } from 'lucide-react';
import DoubleClickEditableField from './ui/DoubleClickEditableField';
import { formatDateToDDMMYYYY } from '../utils/formatDate';


interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onUpdateCustomer: (updatedCustomer: Customer) => void;
    focusOnRoomNumber?: boolean;
    setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

const nationalities = ['American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Japanese', 'Chinese', 'Korean'];
const paymentStatuses: PaymentStatus[] = ['Paid', 'Pending', 'Deposit Paid'];
const tm30Statuses: TM30Status[] = [TM30Status.Pending, TM30Status.Submitted, TM30Status.Acknowledged];
const guestTypeOptions: GuestType[] = ['Adult', 'Child', 'Infant'];
const genders: Gender[] = ['Male', 'Female', 'Other'];

const nationalityToISO: { [key: string]: string } = {
    'American': 'USA', 'British': 'GBR', 'Canadian': 'CAN', 'Australian': 'AUS',
    'German': 'DEU', 'French': 'FRA', 'Japanese': 'JPN', 'Chinese': 'CHN', 'Korean': 'KOR',
};
const getNationalityCode = (nationality: string): string => nationalityToISO[nationality] || nationality.substring(0, 3).toUpperCase();
const getGenderCode = (gender: Gender): string => {
    if (gender === 'Male') return 'M';
    if (gender === 'Female') return 'F';
    return 'O';
};


const ImagePlaceholder: React.FC<{ title: string; shape: 'square' | 'rectangle'; icon: React.ElementType }> = ({ title, shape, icon: Icon }) => {
    const shapeClasses = shape === 'square' ? 'w-24 h-24' : 'w-32 h-24';
    return (
        <button className={`${shapeClasses} bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium text-center px-1">{title}</span>
        </button>
    );
};

const isBookingRegistrationComplete = (customer: Customer): boolean => {
    const requiredFields: (keyof Customer | keyof Guest)[] = ['passportId', 'occupation', 'currentAddress'];
    if (!customer) return false;
    for (const field of requiredFields) {
        if (!(customer as any)[field]) return false;
    }
    for (const guest of customer.guestList) {
        for (const field of requiredFields) {
            if (!(guest as any)[field]) return false;
        }
    }
    return true;
};

const FormField: React.FC<{ label: string, children: React.ReactNode, fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
        <label className="block text-sm font-bold text-black mb-1">{label}</label>
        {children}
    </div>
);


const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, customer, onUpdateCustomer, setToast }) => {
    const { visaTypes, groupedPortsOfEntry, rooms, customers } = useData();
    const [customerData, setCustomerData] = useState<Customer | null>(customer);
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
    const [isSendEmailModalOpen, setSendEmailModalOpen] = useState(false);
    
    const [isRoomDropdownOpen, setRoomDropdownOpen] = useState(false);
    const [roomSearchTerm, setRoomSearchTerm] = useState('');

    useEffect(() => {
        setCustomerData(customer);
        if (customer) {
            setSelectedGuestId(customer.id);
             // For demonstration: Open the dropdown for a specific booking
            if (customer.fullName === 'Lisa Wong') {
                setRoomDropdownOpen(true);
            }
        } else {
            // Reset state when modal is closed
            setRoomDropdownOpen(false);
            setRoomSearchTerm('');
        }
    }, [customer]);

    const handleClose = () => {
        setRoomDropdownOpen(false); // Ensure dropdown is closed when modal closes
        setRoomSearchTerm('');
        onClose();
    };


    const selectedPersonData = useMemo(() => {
        if (!customerData || !selectedGuestId) return null;
        if (selectedGuestId === customerData.id) return customerData;
        return customerData.guestList.find(g => g.id === selectedGuestId);
    }, [customerData, selectedGuestId]);

    const handleSave = (field: keyof (Customer & Guest), value: any) => {
        if (!customerData || !selectedGuestId) return;

        let updatedCustomer: Customer;
        if (selectedGuestId === customerData.id) {
            updatedCustomer = { ...customerData, [field as keyof Customer]: value };
        } else {
            const updatedGuestList = customerData.guestList.map(g =>
                g.id === selectedGuestId ? { ...g, [field as keyof Guest]: value } : g
            );
            updatedCustomer = { ...customerData, guestList: updatedGuestList };
        }
        onUpdateCustomer(updatedCustomer);
    };
    
    const handleConfirmEmailSend = (finalEmail: string) => {
        if (customerData) {
            const updatedCustomer = {...customerData, email: finalEmail, emailStatus: 'Sent' as EmailStatus};
            onUpdateCustomer(updatedCustomer);
            setToast({ message: `Confirmation email sent to ${finalEmail}`, type: 'success' });
            setSendEmailModalOpen(false);
        }
    };
    
    const availableRooms = useMemo(() => {
        const occupiedRoomNumbers = new Set(
            customers.flatMap(c => 
                c.roomStays
                 .filter(rs => rs.bookingStatus === BookingStatus.CheckedIn || rs.bookingStatus === BookingStatus.Confirmed)
                 .map(rs => rs.roomNumber)
            )
        );
        
        const currentRoomNumber = customerData?.roomStays[0]?.roomNumber;
        if (currentRoomNumber) {
            occupiedRoomNumbers.delete(currentRoomNumber);
        }

        return rooms
            .filter(room => !occupiedRoomNumbers.has(room.roomCode))
            .filter(room => 
                room.roomCode.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
                room.type.toLowerCase().includes(roomSearchTerm.toLowerCase())
            );
    }, [rooms, customers, customerData, roomSearchTerm]);
    
    if (!customerData || !selectedPersonData) return null;

    const allGuestsInBooking = [
        { id: customerData.id, name: customerData.fullName, isMainBooker: true, guestType: customerData.guestType },
        ...customerData.guestList.map((g, index) => ({ id: g.id, name: g.name || `Guest ${index + 2}`, isMainBooker: false, guestType: g.guestType }))
    ];

    const isRegComplete = isBookingRegistrationComplete(customerData);
    const totalGuests = allGuestsInBooking.length;
    const isMainBookerSelected = selectedGuestId === customerData.id;
    
    const getStatusBadge = (status: RoomStay) => {
        const statusMap: {[key in typeof status.bookingStatus]: string} = {
            'Confirmed': "bg-blue-100 text-blue-800",
            'Checked-In': "bg-green-100 text-green-800",
            'Pending': "bg-gray-100 text-gray-800",
            'Checked-Out': "bg-gray-100 text-gray-800",
            'Cancelled': "bg-red-100 text-red-800",
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusMap[status.bookingStatus]}`}>{status.bookingStatus}</span>;
    };
    
    const getPaymentStatusComponent = (status: PaymentStatus) => {
        if (status === 'Paid') {
            return <span className="flex items-center text-green-600 font-semibold"><CheckCircle size={14} className="mr-1.5"/> PAID</span>
        }
        return <span className="text-yellow-600 font-semibold">{status.toUpperCase()}</span>
    };
    
    return (
        <>
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={
                 <div className="flex justify-between items-center w-full">
                    <span className="text-xl font-semibold text-gray-800">Booking Details</span>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" className="!border-blue-500 !text-blue-600 !bg-white hover:!bg-blue-50" leftIcon={<Mail size={16}/>} onClick={() => setSendEmailModalOpen(true)}>Send Confirmation Email</Button>
                    </div>
                </div>
            }
        >
            <div className="flex -mx-6 -mb-6" style={{height: '75vh'}}>
                <div className="w-1/3 border-r border-gray-200 bg-gray-100 p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-between">
                        <span className="flex items-center"><Users size={16} className="mr-2"/>Guest List</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isRegComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {`Guests: ${totalGuests}/${totalGuests}`} {isRegComplete && '✅'}
                        </span>
                    </h3>
                    <div className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
                        {allGuestsInBooking.map((guest, index) => (
                            <button
                                key={guest.id}
                                onClick={() => setSelectedGuestId(guest.id)}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedGuestId === guest.id ? 'bg-blue-600 text-white shadow font-bold' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}
                            >
                                <span className="flex-1 pr-2">
                                    {guest.isMainBooker ? 'Main Booker:' : `Guest ${index + 1}:`} <span className="font-semibold">{guest.name}</span>
                                </span>
                                <span className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${selectedGuestId === guest.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {guest.guestType}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-2/3 bg-white flex flex-col">
                    {/* Booking Summary Bar */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="relative flex items-center gap-2">
                                <Bed size={16} className="text-gray-500"/>
                                <span className="font-bold text-black">Room:</span> 
                                <button onClick={() => setRoomDropdownOpen(!isRoomDropdownOpen)} className="text-blue-600 font-semibold hover:underline">{customerData.roomStays.map(rs=>rs.roomNumber).join(', ')}</button>
                                {isRoomDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-20">
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input 
                                                    type="text"
                                                    placeholder="Search room..."
                                                    value={roomSearchTerm}
                                                    onChange={(e) => setRoomSearchTerm(e.target.value)}
                                                    className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <ul className="py-1 max-h-48 overflow-y-auto">
                                            {availableRooms.map(room => (
                                                <li key={room.id}>
                                                    <button 
                                                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 flex justify-between items-center"
                                                    >
                                                       <span><span className="font-semibold">{room.roomCode}</span> ({room.type})</span>
                                                       <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Available</span>
                                                    </button>
                                                </li>
                                            ))}
                                             {availableRooms.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 text-center">No other rooms available.</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                             <div className="h-4 border-l border-gray-300"></div>
                             <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500"/>
                                <span className="font-bold text-black">Dates:</span> 
                                <span className="text-gray-800 font-medium">{formatDateToDDMMYYYY(customerData.checkInDate)} - {formatDateToDDMMYYYY(customerData.checkOutDate)}</span>
                            </div>
                             <div className="h-4 border-l border-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-black">Status:</span> 
                                {getStatusBadge(customerData.roomStays[0])}
                            </div>
                            <div className="h-4 border-l border-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-black">Payment:</span>
                                {getPaymentStatusComponent(customerData.paymentStatus)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-none p-6">
                        <div className="space-y-6">
                            <div className="flex gap-4 mb-4">
                                <ImagePlaceholder title="Profile Photo (Face)" shape="square" icon={User} />
                                <ImagePlaceholder title="Passport/ID Scan" shape="rectangle" icon={FileScan} />
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-base font-bold text-black bg-gray-100 p-2 rounded-md mb-4">[ Personal Information ]</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <FormField label="Name and Surname">
                                            <DoubleClickEditableField label="Name and Surname" initialValue={isMainBookerSelected ? (selectedPersonData as Customer).fullName : (selectedPersonData as Guest).name} onSave={(val) => handleSave(isMainBookerSelected ? 'fullName' : 'name', val)} />
                                        </FormField>
                                        <FormField label="Nationality">
                                            <DoubleClickEditableField label="Nationality" type="select" options={nationalities} initialValue={selectedPersonData.nationality} displayTransform={getNationalityCode} onSave={(val) => handleSave('nationality', val)} />
                                        </FormField>
                                        <FormField label="ID Card / Passport No.">
                                            <DoubleClickEditableField label="ID Card / Passport No." initialValue={selectedPersonData.passportId} onSave={(val) => handleSave('passportId', val)} />
                                        </FormField>
                                        <FormField label="Issued By">
                                            <DoubleClickEditableField label="Issued By" initialValue={selectedPersonData.issuedBy} onSave={(val) => handleSave('issuedBy', val)} />
                                        </FormField>
                                        <FormField label="Date of Birth">
                                            <DoubleClickEditableField label="Date of Birth" type="date" initialValue={selectedPersonData.dob} onSave={(val) => handleSave('dob', val)} />
                                        </FormField>
                                        <FormField label="Gender">
                                            <DoubleClickEditableField label="Gender" type="select" options={genders} initialValue={selectedPersonData.gender} displayTransform={(v) => getGenderCode(v as Gender)} onSave={(val) => handleSave('gender', val)} />
                                        </FormField>
                                        <FormField label="Guest Type">
                                            <DoubleClickEditableField label="Guest Type" type="select" options={guestTypeOptions} initialValue={selectedPersonData.guestType} onSave={(val) => handleSave('guestType', val)} />
                                        </FormField>
                                        <FormField label="Occupation" >
                                            <DoubleClickEditableField label="Occupation" initialValue={selectedPersonData.occupation} onSave={(val) => handleSave('occupation', val)} />
                                        </FormField>
                                        <FormField label="Current Address" fullWidth>
                                            <DoubleClickEditableField label="Current Address" type="textarea" initialValue={selectedPersonData.currentAddress} onSave={(val) => handleSave('currentAddress', val)} />
                                        </FormField>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-black bg-gray-100 p-2 rounded-md mb-4">[ Travel & Visa Information ]</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <FormField label="Arriving From">
                                            <DoubleClickEditableField label="Arriving From" initialValue={selectedPersonData.arrivingFrom} onSave={(val) => handleSave('arrivingFrom', val)} />
                                        </FormField>
                                        <FormField label="Going To">
                                            <DoubleClickEditableField label="Going To" initialValue={selectedPersonData.goingTo} onSave={(val) => handleSave('goingTo', val)} />
                                        </FormField>
                                        <FormField label="Date of Arrival">
                                            <DoubleClickEditableField label="Date of Arrival" type="date" initialValue={isMainBookerSelected ? (selectedPersonData as Customer).checkInDate : (selectedPersonData as Guest).dateOfArrival} onSave={(val) => handleSave(isMainBookerSelected ? 'checkInDate' : 'dateOfArrival', val)} />
                                        </FormField>
                                        <FormField label="Visa Type">
                                            <DoubleClickEditableField label="Visa Type" type="select" options={visaTypes} initialValue={selectedPersonData.visaType} onSave={(val) => handleSave('visaType', val)} />
                                        </FormField>
                                        <FormField label="Expire Date of Stay">
                                            <DoubleClickEditableField label="Expire Date of Stay" type="date" initialValue={selectedPersonData.expireDateOfStay} onSave={(val) => handleSave('expireDateOfStay', val)} />
                                        </FormField>
                                        <FormField label="Point of Entry">
                                            <DoubleClickEditableField label="Point of Entry" type="searchable-select" groupedOptions={groupedPortsOfEntry} initialValue={selectedPersonData.portOfEntry} onSave={(val) => handleSave('portOfEntry', val)} />
                                        </FormField>
                                        <FormField label="Arrival Card TM.No.">
                                            <DoubleClickEditableField label="Arrival Card TM.No." initialValue={selectedPersonData.arrivalCardNumber} onSave={(val) => handleSave('arrivalCardNumber', val)} />
                                        </FormField>
                                        <FormField label="Relationship">
                                            <DoubleClickEditableField label="Relationship" initialValue={selectedPersonData.relationship} onSave={(val) => handleSave('relationship', val)} />
                                        </FormField>
                                        <FormField label="TM.30 Status" fullWidth>
                                            {isMainBookerSelected 
                                                ? <DoubleClickEditableField label="TM.30 Status" type="select" options={tm30Statuses} initialValue={(selectedPersonData as Customer).tm30Status} onSave={(val) => handleSave('tm30Status', val)} />
                                                : <div className="p-1.5 min-h-[40px] flex items-center text-gray-500">N/A for accompanying guests</div>
                                            }
                                        </FormField>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
        {isSendEmailModalOpen && (
            <SendEmailModal 
                isOpen={isSendEmailModalOpen}
                onClose={() => setSendEmailModalOpen(false)}
                onConfirmSend={handleConfirmEmailSend}
                customer={customerData}
            />
        )}
        </>
    );
};

export default BookingDetailsModal;
