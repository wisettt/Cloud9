import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { useData } from '../contexts/DataContext';
// FIX: Import CustomerStatus type.
// FIX: Import PaymentStatus type to resolve type errors.
import { Room, RoomStatus, GuestType, Customer, BookingStatus, Gender, RoomStay, TM30Status, Guest, CustomerStatus, CustomerActivityStatus, PaymentStatus } from '../types';
import { ArrowLeft, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Minus, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

const Calendar: React.FC<{
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    checkInDate: string;
    checkOutDate: string;
    onDateSelect: (date: string) => void;
}> = ({ currentMonth, setCurrentMonth, checkInDate, checkOutDate, onDateSelect }) => {
    
    const renderMonthGrid = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();

        // Ensure dates are parsed as UTC to prevent off-by-one errors
        const checkIn = checkInDate ? new Date(Date.parse(checkInDate + 'T00:00:00Z')) : null;
        const checkOut = checkOutDate ? new Date(Date.parse(checkOutDate + 'T00:00:00Z')) : null;
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-start-${month}-${i}`} className="text-center p-2"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(Date.UTC(year, month, i));
            const dateString = dayDate.toISOString().split('T')[0];

            const isSelectedStart = checkIn && dayDate.getTime() === checkIn.getTime();
            const isSelectedEnd = checkOut && dayDate.getTime() === checkOut.getTime();
            const isInRange = checkIn && checkOut && dayDate > checkIn && dayDate < checkOut;
            
            const yesterday = new Date(todayUTC);
            yesterday.setUTCDate(todayUTC.getUTCDate() - 1);
            const isDisabled = dayDate <= yesterday;


            let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 relative text-sm";
            
            if (isDisabled) {
                dayClasses += " text-gray-500 line-through cursor-not-allowed";
            } else {
                dayClasses += " cursor-pointer text-white hover:bg-blue-700";
            }
            
            if (isSelectedStart || isSelectedEnd) {
                dayClasses += " bg-blue-600 !text-white font-semibold";
            } else if (isInRange) {
                // In-range days handled by the strip
            }

            // Continuous strip styling
            let rangeBgClass = "flex items-center justify-center";
            if (isInRange) {
                rangeBgClass += " bg-blue-800/50";
            } 
            
            if (isSelectedStart && checkOut) rangeBgClass += " rounded-l-full";
            if (isSelectedEnd) rangeBgClass += " rounded-r-full";
            if (checkIn && checkOut && checkIn.getTime() === checkOut.getTime()) {
                 rangeBgClass = "flex items-center justify-center"; // Reset if single day
            }


            days.push(
                <div key={dateString} className={`${rangeBgClass}`}>
                    <button
                        onClick={() => !isDisabled && onDateSelect(dateString)}
                        disabled={isDisabled}
                        className={dayClasses}
                    >
                        {i}
                    </button>
                </div>
            );
        }
        return (
            <div>
                <h3 className="font-bold text-white text-center mb-2">{date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h3>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs text-blue-300 font-bold mb-2">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days}
                </div>
            </div>
        );
    }
    
    const nextMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1));

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-700 w-full">
            <div className="flex justify-between items-center mb-4 px-4">
                <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-700 text-gray-300"><ChevronLeft size={20} /></button>
                <div className="font-bold text-white"></div>
                <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-700 text-gray-300"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderMonthGrid(currentMonth)}
                {renderMonthGrid(nextMonth)}
            </div>
            <div className="mt-4 text-center">
                <button onClick={() => {
                    const today = new Date();
                    today.setUTCHours(0,0,0,0);
                    onDateSelect(today.toISOString().split('T')[0])
                }} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Today</button>
            </div>
        </div>
    );
};

interface AccompanyingGuest {
    id: number;
    name: string;
    type: GuestType;
}

const CreateBooking: React.FC = () => {
    const navigate = useNavigate();
    const { rooms, setCustomers } = useData();
    
    const [bookingDetails, setBookingDetails] = useState({
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        children: 0,
    });
    const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
    const [mainBooker, setMainBooker] = useState({ name: '', email: '' });
    const [accompanyingGuests, setAccompanyingGuests] = useState<AccompanyingGuest[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
    
    const [floorFilter, setFloorFilter] = useState('All Floors');
    const [roomTypeFilter, setRoomTypeFilter] = useState('All Types');
    const [sendEmail, setSendEmail] = useState(true);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().setUTCHours(0,0,0,0)));
    const calendarRef = useRef<HTMLDivElement>(null);
    const [isRoomSelectionExpanded, setIsRoomSelectionExpanded] = useState(true);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateInputClick = () => {
        const dateToFocus = bookingDetails.checkInDate ? new Date(Date.parse(bookingDetails.checkInDate + 'T00:00:00Z')) : new Date();
        dateToFocus.setUTCHours(0,0,0,0);
        setCurrentMonth(new Date(Date.UTC(dateToFocus.getUTCFullYear(), dateToFocus.getUTCMonth(), 1)));
        setIsCalendarOpen(true);
    };

    const handleDateSelect = (dateString: string) => {
        const date = new Date(Date.parse(dateString + 'T00:00:00Z'));
        const checkIn = bookingDetails.checkInDate ? new Date(Date.parse(bookingDetails.checkInDate + 'T00:00:00Z')) : null;
        const checkOut = bookingDetails.checkOutDate ? new Date(Date.parse(bookingDetails.checkOutDate + 'T00:00:00Z')) : null;
    
        if (!checkIn || (checkIn && checkOut)) {
            setBookingDetails({ ...bookingDetails, checkInDate: dateString, checkOutDate: '' });
        } else if (checkIn && !checkOut) {
            if (date > checkIn) {
                setBookingDetails({ ...bookingDetails, checkOutDate: dateString });
                setIsCalendarOpen(false);
            } else {
                setBookingDetails({ ...bookingDetails, checkInDate: dateString, checkOutDate: '' });
            }
        }
        // Reset room selection when dates change
        setSelectedRooms([]);
    };

    const handleBookingDetailChange = (field: keyof typeof bookingDetails, value: any) => {
        setBookingDetails({ ...bookingDetails, [field]: value });
        setSelectedRooms([]);
    };
    
    const availableRooms = useMemo(() => {
        return rooms.filter(room => room.status === RoomStatus.Available);
    }, [rooms]);

    // Explicitly type the parameters of the sort callback function
    const floorOptions = useMemo(() => ['All Floors', ...Array.from(new Set(availableRooms.map(r => r.floor))).sort((a: string, b: string) => parseInt(a)-parseInt(b))], [availableRooms]);
    const roomTypeOptions = useMemo(() => ['All Types', ...Array.from(new Set(availableRooms.map(r => r.type)))], [availableRooms]);
    
    const filteredDisplayRooms = useMemo(() => {
        return availableRooms
            .filter(room => floorFilter === 'All Floors' || room.floor === floorFilter)
            .filter(room => roomTypeFilter === 'All Types' || room.type === roomTypeFilter);
    }, [availableRooms, floorFilter, roomTypeFilter]);
    
    const stayDuration = useMemo(() => {
        if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
        const start = new Date(Date.parse(bookingDetails.checkInDate + 'T00:00:00Z'));
        const end = new Date(Date.parse(bookingDetails.checkOutDate + 'T00:00:00Z'));
        if (start.getTime() >= end.getTime()) return 0;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [bookingDetails.checkInDate, bookingDetails.checkOutDate]);

    const totalPrice = useMemo(() => {
        if (selectedRooms.length === 0) return 0;
        const totalRoomPricePerNight = selectedRooms.reduce((sum, room) => sum + room.price, 0);
        return totalRoomPricePerNight * stayDuration;
    }, [selectedRooms, stayDuration]);

    const isCriteriaMet = bookingDetails.checkInDate && bookingDetails.checkOutDate && stayDuration > 0;
    const isSubmitDisabled = selectedRooms.length === 0 || !mainBooker.name;

    const handleToggleRoomSelection = (room: Room) => {
        setSelectedRooms(prev => 
            prev.some(r => r.id === room.id) 
                ? prev.filter(r => r.id !== room.id) 
                : [...prev, room]
        );
    };
    
     const handleSubmitBooking = () => {
        if (isSubmitDisabled) return;

        const newId = `C${Date.now()}`;
        const newBookingId = `B${Date.now().toString().slice(-6)}`;
        
        const roomStays: RoomStay[] = selectedRooms.map(r => ({ roomNumber: r.roomCode, bookingStatus: BookingStatus.Confirmed }));
        
        const accompanyingGuestList: Guest[] = accompanyingGuests.map(ag => ({
            id: `G${Date.now()}${ag.id}`,
            name: ag.name,
            guestType: ag.type,
            passportId: '', nationality: '', gender: 'Other', dob: '', phone: '',
            dateOfArrival: bookingDetails.checkInDate, visaType: 'Tourist Visa (TR)',
            portOfEntry: '', arrivalCardNumber: '', expireDateOfStay: bookingDetails.checkOutDate,
            relationship: 'Guest', occupation: '', currentAddress: '', arrivingFrom: '',
            goingTo: '', issuedBy: '', remarks: ''
        }));
        
        const adultsCount = 1 + accompanyingGuests.filter(g => g.type === 'Adult').length;
        const childrenCount = accompanyingGuests.filter(g => g.type === 'Child').length;

        const newBooking: Customer = {
            id: newId, bookingId: newBookingId, fullName: mainBooker.name, email: mainBooker.email,
            checkInDate: bookingDetails.checkInDate, checkOutDate: bookingDetails.checkOutDate,
            adults: adultsCount, children: childrenCount, roomStays,
            paymentStatus, emailStatus: sendEmail ? 'Sent' : 'Not Sent', totalPrice, guestList: accompanyingGuestList,
            nationality: '', passportId: '', gender: 'Other', dob: '', phone: '',
            guestType: 'Adult', customerStatus: 'Regular', activityStatus: 'Active', currentAddress: '', visaType: 'Tourist Visa (TR)',
            expireDateOfStay: bookingDetails.checkOutDate, portOfEntry: '', arrivalCardNumber: '',
            relationship: 'Guest', tm30Status: TM30Status.Pending,
            occupation: '', arrivingFrom: '', goingTo: '', issuedBy: '', remarks: '',
        };

        setCustomers(prev => [...prev, newBooking]);
        
        const newRowId = `${newBooking.id}-${selectedRooms[0].roomCode}`;
        navigate('/bookings', { state: { newBookingInfo: { rowId: newRowId, guestName: newBooking.fullName } } });
    };

    const addAccompanyingGuest = () => {
        setAccompanyingGuests(prev => [...prev, {id: Date.now(), name: '', type: 'Adult'}]);
    };

    const updateAccompanyingGuest = (id: number, field: 'name' | 'type', value: string) => {
        setAccompanyingGuests(prev => prev.map(guest => guest.id === id ? {...guest, [field]: value} : guest));
    };

    const removeAccompanyingGuest = (id: number) => {
        setAccompanyingGuests(prev => prev.filter(guest => guest.id !== id));
    };
    
    const DateInputDisplay: React.FC<{label: string, value: string, onClick: () => void}> = ({ label, value, onClick }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div onClick={onClick} className="relative w-full cursor-pointer group">
                <div className="flex items-center w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <span className="text-xl font-bold text-black">{formatDateToDDMMYYYY(value) || 'dd/mm/yyyy'}</span>
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <CalendarIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/bookings')} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors mr-2">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Create Booking</h1>
            </div>

            <div className="relative flex flex-col lg:flex-row gap-8 lg:items-start">
                <div className="flex-1 space-y-6 lg:pb-0 pb-56">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Booking Criteria</h2>
                        <div className="space-y-4">
                             <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DateInputDisplay label="Check-In" value={bookingDetails.checkInDate} onClick={handleDateInputClick} />
                                    <DateInputDisplay label="Check-Out" value={bookingDetails.checkOutDate} onClick={handleDateInputClick} />
                                </div>
                                {isCalendarOpen && (
                                    <div className="absolute top-full left-0 mt-2 z-10 w-full md:w-[700px]" ref={calendarRef}>
                                        <Calendar
                                            currentMonth={currentMonth}
                                            setCurrentMonth={setCurrentMonth}
                                            checkInDate={bookingDetails.checkInDate}
                                            checkOutDate={bookingDetails.checkOutDate}
                                            onDateSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            {stayDuration > 0 && <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Total Stay: {stayDuration} Night(s)</span>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input id="adults" label="Total Adults" type="number" min="1" value={bookingDetails.adults} onChange={(e) => handleBookingDetailChange('adults', parseInt(e.target.value, 10) || 1)} />
                                <Input id="children" label="Total Children" type="number" min="0" value={bookingDetails.children} onChange={(e) => handleBookingDetailChange('children', parseInt(e.target.value, 10) || 0)} />
                            </div>
                        </div>
                    </div>

                    {isCriteriaMet && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <button 
                                onClick={() => setIsRoomSelectionExpanded(!isRoomSelectionExpanded)}
                                className="w-full flex justify-between items-center text-left py-2"
                            >
                                <h2 className="text-xl font-semibold text-gray-800">2. Available Rooms</h2>
                                {isRoomSelectionExpanded ? <ChevronUp className="text-gray-600" /> : <ChevronDown className="text-gray-600" />}
                            </button>

                            {isRoomSelectionExpanded && (
                                <div className="mt-4">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
                                        <div className="flex gap-4">
                                            <Select id="floor-filter" label="Filter by Floor" value={floorFilter} onChange={e => setFloorFilter(e.target.value)}>
                                                {floorOptions.map(opt => <option key={opt}>{opt}</option>)}
                                            </Select>
                                            <Select id="type-filter" label="Filter by Room Type" value={roomTypeFilter} onChange={e => setRoomTypeFilter(e.target.value)}>
                                                {roomTypeOptions.map(opt => <option key={opt}>{opt}</option>)}
                                            </Select>
                                        </div>
                                        <p className="font-semibold text-gray-700">{selectedRooms.length} Room(s) Selected</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredDisplayRooms.map(room => {
                                            const isSelected = selectedRooms.some(r => r.id === room.id);
                                            return (
                                                <div key={room.id} className={`border-2 rounded-lg p-4 flex flex-col justify-between transition-all ${isSelected ? 'border-blue-600 ring-2 ring-blue-500/50 shadow-lg' : 'border-gray-200 hover:border-blue-400'}`}>
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-semibold text-gray-800">{room.type} Room</h4>
                                                            <p className="text-sm text-gray-500">{room.floor}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Room: {room.roomCode}</p>
                                                    </div>
                                                    <Button size="sm" className={`mt-4 w-full ${isSelected ? '!bg-red-50 hover:!bg-red-100 !text-red-600 !border-red-200' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'}`} variant="secondary" leftIcon={isSelected ? <Minus size={16} /> : <Plus size={16} />} onClick={() => handleToggleRoomSelection(room)}>
                                                        {isSelected ? 'Remove' : 'Add Room'}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {filteredDisplayRooms.length === 0 && <p className="text-gray-500 text-center col-span-full py-4">No available rooms found for the selected criteria and filters.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Guest Information</h2>
                         <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Main Booker</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input id="main-guest-name" label="Guest Name" value={mainBooker.name} onChange={e => setMainBooker({...mainBooker, name: e.target.value})} required placeholder="Full Name"/>
                                    <Input id="main-guest-email" label="Email (Optional)" type="email" value={mainBooker.email} onChange={e => setMainBooker({...mainBooker, email: e.target.value})} placeholder="Email Address"/>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Accompanying Guests</h3>
                                <div className="space-y-3">
                                    {accompanyingGuests.map((guest, index) => (
                                        <div key={guest.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                                            <div className="col-span-6">
                                                <Input id={`guest-name-${guest.id}`} label={`Guest ${index+2} Name`} value={guest.name} onChange={(e) => updateAccompanyingGuest(guest.id, 'name', e.target.value)} placeholder="Full Name" />
                                            </div>
                                            <div className="col-span-5">
                                                <Select id={`guest-type-${guest.id}`} label="Type" value={guest.type} onChange={(e) => updateAccompanyingGuest(guest.id, 'type', e.target.value as GuestType)}>
                                                    <option value="Adult">Adult</option>
                                                    <option value="Child">Child</option>
                                                    <option value="Infant">Infant</option>
                                                </Select>
                                            </div>
                                            <div className="col-span-1">
                                                <button type="button" onClick={() => removeAccompanyingGuest(guest.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100" title="Remove Guest">
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="secondary" className="!bg-blue-50 hover:!bg-blue-100 !text-blue-600" leftIcon={<PlusCircle size={16}/>} onClick={addAccompanyingGuest}>
                                        Add Guest
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-96">
                    <div className="sticky top-8 space-y-4 bg-white p-6 rounded-xl shadow-sm border">
                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Booking Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Dates:</span> <span className="font-medium text-gray-800">{formatDateToDDMMYYYY(bookingDetails.checkInDate) || 'N/A'} - {formatDateToDDMMYYYY(bookingDetails.checkOutDate) || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Total Nights:</span> <span className="font-medium text-gray-800">{stayDuration > 0 ? stayDuration : '—'}</span></div>
                        </div>
                        <div className="pt-2">
                             <h4 className="font-semibold text-gray-700 mb-2">Selected Rooms</h4>
                              {selectedRooms.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {selectedRooms.map(room => (
                                        <li key={room.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <span className="font-medium text-gray-800">{room.roomCode} <span className="text-gray-500 font-normal">({room.type})</span></span>
                                            <span className="font-semibold text-gray-800">THB {room.price.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">No rooms selected yet.</p>}
                        </div>
                         <div className="pt-2">
                             <h4 className="font-semibold text-gray-700 mb-2">Guests</h4>
                            <ul className="space-y-1 text-sm text-gray-800">
                                {mainBooker.name && <li>• {mainBooker.name} (Main Booker)</li>}
                                {accompanyingGuests.map(g => g.name && <li key={g.id}>• {g.name} ({g.type})</li>)}
                            </ul>
                         </div>
                        <div className="border-t pt-4 space-y-4">
                             <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total Price:</span>
                                <span>THB {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             <Select id="paymentStatus" label="Payment Status" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}>
                                <option>Pending</option>
                                <option>Deposit Paid</option>
                                <option>Paid</option>
                            </Select>
                            <div className="flex items-center">
                                <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-900">Send confirmation email to guest immediately</label>
                            </div>
                            <Button type="button" onClick={handleSubmitBooking} disabled={isSubmitDisabled} className="w-full !bg-green-600 hover:!bg-green-700 focus:!ring-green-500" size="lg">Submit Booking</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBooking;