import { useState } from 'react';
import { Room, Customer, User, Role, RoleDetails, PendingApproval, RoomStatus, ApprovalStatus, RoomType, PaymentStatus, Gender, Guest, BookingStatus, VisaType, PortOfEntry, TM30Status, EmailStatus, RoomStay, GuestType, BedType, UserStatus, CustomerStatus, CustomerActivityStatus } from '../types';

const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'James', 'Linda', 'Robert', 'Patricia'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson', 'Moore'];
const nationalities = ['American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Japanese', 'Chinese', 'Korean'];
const genders: Gender[] = ['Male', 'Female'];
const occupations = ['Engineer', 'Doctor', 'Teacher', 'Student', 'Business Owner', 'Retired', 'Software Developer', 'Artist'];
const locations = ['Bangkok, Thailand', 'Chiang Mai, Thailand', 'Phuket, Thailand', 'Pattaya, Thailand', 'Krabi, Thailand', 'London, UK', 'New York, USA'];

export const visaTypes: VisaType[] = [
    'Visa Exemption (ยกเว้นวีซ่า)',
    'Visa on Arrival (VOA)',
    'Tourist Visa (TR)',
    'Non-Immigrant (NON-B)',
    'Non-Immigrant (NON-ED)',
    'Non-Immigrant (NON-O)',
    'Non-Immigrant (NON-O-A)',
    'LTR Visa',
    'SMART Visa',
    'อื่นๆ (Others)'
];
const tm30Statuses: TM30Status[] = [TM30Status.Pending, TM30Status.Submitted, TM30Status.Acknowledged];

export const groupedPortsOfEntry = [
    {
        label: '✈️ Airports (ช่องทางอนุญาตทางอากาศ)',
        options: [
            'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)',
            'ท่าอากาศยานดอนเมือง (Don Mueang International Airport)',
            'ท่าอากาศยานเชียงใหม่ (Chiangmai International Airport)',
            'ท่าอากาศยานภูเก็ต (Phuket International Airport)',
            'ท่าอากาศยานหาดใหญ่ (Hatyai International Airport)',
            'ท่าอากาศยานอู่ตะภา (U Tapao Airport)',
            'ท่าอากาศยานสมุย (Samui Airport)',
            'ท่าอากาศยานกระบี่ (Krabi Airport)',
            'ท่าอากาศยานเชียงราย (Chiangrai Airport)',
            'ท่าอากาศยานสุราษฎร์ธานี (Surat Thani Airport)',
            'ท่าอากาศยานสุโขทัย (Sukhothai International Airport)',
        ],
    },
    {
        label: '🚗 Land Border Checkpoints (ช่องทางอนุญาตทางบก)',
        options: [
            'ด่าน ตม. สะเดา (สงขลา)',
            'ด่าน ตม. หนองคาย',
            'ด่าน ตม. อรัญประเทศ (สระแก้ว)',
            'ด่าน ตม. แม่สาย (เชียงราย)',
            'ด่าน ตม. เบตง (ยะลา)',
            'ด่าน ตม. ปาดังเบซาร์ (สงขลา)',
            'ด่าน ตม. สุไหงโก-ลก (นราธิวาส)',
            'ด่าน ตม. เชียงแสน (เชียงราย)',
            'ด่าน ตม. เชียงของ (เชียงราย)',
            'ด่าน ตม. มุกดาหาร',
            'ด่าน ตม. ตาก (แม่สอด)',
            'ด่าน ตม. คลองใหญ่ (ตราด)',
            'ด่าน ตม. ช่องจอม (สุรินทร์)',
            'ด่าน ตม. ภู่싱ห์ (ศรีสะเกษ)',
            'ด่าน ตม. ท่าลี่ (เลย)',
            'ด่าน ตม. นครพนม',
            'ด่าน ตม. บึงกาฬ',
        ]
    },
    {
        label: '🚢 Sea/River Ports (ช่องทางอนุญาตทางน้ำ)',
        options: [
            'ท่าเรือกรุงเทพ (Bangkok Harbour)',
            'ท่าเรือแหลมฉบัง (ชลบุรี)',
            'ท่าเรือศรีราชา (ชลบุรี)',
            'ท่าเรือมาบตาพุด (ระยอง)',
            'ท่าเรือสมุย (สุราษฎร์ธานี)',
            'ท่าเรือภูเก็ต',
            'ท่าเรือสตูล (ด่าน ตม. ตำมะลัง)',
            'ท่าเรือสงขลา',
            'ท่าเรือกระบี่',
        ]
    }
];

const allPortsOfEntry = groupedPortsOfEntry.flatMap(group => group.options);

const priceMap: Record<RoomType, number> = {
    'Standard': 1000,
    'Superior': 1500,
    'Deluxe': 2000,
    'Connecting': 2500,
};

const masterRooms: Room[] = [
    { id: 'R101', roomCode: 'RM101', floor: '1st Floor', type: 'Standard', bedType: 'King Bed', price: priceMap['Standard'], status: RoomStatus.Occupied, maxOccupancy: 2, description: '', floorAndview: '1st Floor - Garden View', internalNotes: 'AC checked on 2024-07-20.' },
    { id: 'R102', roomCode: 'RM102', floor: '1st Floor', type: 'Standard', bedType: 'Twin Bed', price: priceMap['Standard'], status: RoomStatus.Available, maxOccupancy: 2, description: '', floorAndview: '1st Floor - Garden View', internalNotes: '' },
    { id: 'R103', roomCode: 'RM103', floor: '1st Floor', type: 'Standard', bedType: 'King Bed', price: priceMap['Standard'], status: RoomStatus.Cleaning, maxOccupancy: 2, description: '', floorAndview: '1st Floor - City View', internalNotes: '' },
    { id: 'R104', roomCode: 'RM104', floor: '1st Floor', type: 'Superior', bedType: 'King Bed', price: priceMap['Superior'], status: RoomStatus.Occupied, maxOccupancy: 2, description: '', floorAndview: '1st Floor - Pool View', internalNotes: 'Guest requested extra towels.' },
    { id: 'R105', roomCode: 'RM105', floor: '1st Floor', type: 'Superior', bedType: 'Twin Bed', price: priceMap['Superior'], status: RoomStatus.Available, maxOccupancy: 2, description: '', floorAndview: '1st Floor - Garden View', internalNotes: '' },
    { id: 'R201', roomCode: 'RM201', floor: '2nd Floor', type: 'Deluxe', bedType: 'King Bed', price: priceMap['Deluxe'], status: RoomStatus.Available, maxOccupancy: 2, description: '', floorAndview: '2nd Floor - Ocean View', internalNotes: '' },
    { id: 'R202', roomCode: 'RM202', floor: '2nd Floor', type: 'Deluxe', bedType: 'King Bed', price: priceMap['Deluxe'], status: RoomStatus.Occupied, maxOccupancy: 2, description: '', floorAndview: '2nd Floor - Ocean View', internalNotes: '' },
    { id: 'R203', roomCode: 'RM203', floor: '2nd Floor', type: 'Deluxe', bedType: 'Twin Bed', price: priceMap['Deluxe'], status: RoomStatus.Occupied, maxOccupancy: 2, description: '', floorAndview: '2nd Floor - City View', internalNotes: '' },
    { id: 'R301', roomCode: 'RM301', floor: '3rd Floor', type: 'Connecting', bedType: 'King Bed', price: priceMap['Connecting'], status: RoomStatus.Occupied, maxOccupancy: 4, description: '', floorAndview: '3rd Floor - Mountain View', internalNotes: '' },
    { id: 'R302', roomCode: 'RM302', floor: '3rd Floor', type: 'Connecting', bedType: 'Twin Bed', price: priceMap['Connecting'], status: RoomStatus.Occupied, maxOccupancy: 0, description: 'Linked to RM301', floorAndview: '3rd Floor - Mountain View', internalNotes: 'Linked room' },
];

const generateRemainingRooms = (startId: number, count: number): Room[] => {
    const rooms: Room[] = [];
    const roomTypes: RoomType[] = ['Standard', 'Deluxe', 'Superior', 'Connecting'];
    const bedTypes: BedType[] = ['King Bed', 'Twin Bed', 'Queen Bed'];
    const views = ['Garden View', 'City View', 'Pool View', 'Ocean View'];
    for (let i = 0; i < count; i++) {
        const floor = 3 + Math.floor(i / 10);
        const roomNum = (floor * 100) + (i % 10) + 3;
        const roomType = roomTypes[i % roomTypes.length];
        rooms.push({
            id: `R${startId + i}`,
            roomCode: `RM${roomNum}`,
            floor: `${floor}th Floor`,
            type: roomType,
            bedType: bedTypes[i % bedTypes.length],
            price: priceMap[roomType],
            status: RoomStatus.Available,
            maxOccupancy: 2,
            description: '',
            floorAndview: `${floor}th Floor - ${views[i % views.length]}`,
            internalNotes: i % 5 === 0 ? `Last maintenance on ${new Date().getFullYear()}-01-15` : ''
        });
    }
    return rooms;
};

export const allRooms = [...masterRooms, ...generateRemainingRooms(500, 45 - masterRooms.length)];


// --- HIGH-FIDELITY CUSTOMER DATA GENERATION ---

interface MasterCustomerProfile {
    name: string;
    email: string;
    phone: string;
    passport: string;
    nationality: string;
    gender: Gender;
    totalBookings: number;
    customerStatus?: CustomerStatus;
    activityStatus?: CustomerActivityStatus;
    isCurrentlyCheckedIn?: { roomCode: string };
}

const masterCustomerProfiles: MasterCustomerProfile[] = [
    { name: 'John Smith', email: 'j.smith@example.com', phone: '(555) 123-4567', passport: 'P71895477', nationality: 'American', gender: 'Male', totalBookings: 12, customerStatus: 'VIP', activityStatus: 'Active', isCurrentlyCheckedIn: { roomCode: 'RM101' } },
    { name: 'Lisa Wong', email: 'lisa.wong@corp.com', phone: '(555) 987-6543', passport: 'P80202533', nationality: 'Canadian', gender: 'Female', totalBookings: 5, activityStatus: 'Active', isCurrentlyCheckedIn: { roomCode: 'RM104' } },
    { name: 'Robert Brown', email: 'r.brown@mail.com', phone: '(555) 444-3333', passport: 'P32350392', nationality: 'British', gender: 'Male', totalBookings: 1, activityStatus: 'Active', isCurrentlyCheckedIn: { roomCode: 'RM202' } },
    { name: 'Jane Williams', email: 'j.williams@web.com', phone: '(555) 111-2222', passport: 'P63451270', nationality: 'Australian', gender: 'Female', totalBookings: 2, customerStatus: 'Blacklisted', activityStatus: 'Inactive' },
    { name: 'Sarah Lee', email: 's.lee@kr.com', phone: '(555) 777-8888', passport: 'P75685294', nationality: 'Korean', gender: 'Female', totalBookings: 7, activityStatus: 'Active' },
];

const generateMasterCustomerBookings = (): Customer[] => {
    const bookings: Customer[] = [];
    const today = new Date();

    masterCustomerProfiles.forEach(profile => {
        for (let i = 0; i < profile.totalBookings; i++) {
            const isLatestBooking = i === 0;
            let checkInDate: Date, checkOutDate: Date, bookingStatus: BookingStatus, roomNumber: string;
            
            if (isLatestBooking && profile.isCurrentlyCheckedIn) {
                // This is the current, checked-in booking
                checkInDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // Checked in 2 days ago
                checkOutDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000); // Stays for 5 more days
                bookingStatus = BookingStatus.CheckedIn;
                roomNumber = profile.isCurrentlyCheckedIn.roomCode;
            } else {
                // These are historical, checked-out bookings
                const daysInPast = 30 + (i * 45) + (profile.name.length * 2);
                checkOutDate = new Date(today.getTime() - daysInPast * 24 * 60 * 60 * 1000);
                const stayDuration = 3 + (i % 5);
                checkInDate = new Date(checkOutDate.getTime() - stayDuration * 24 * 60 * 60 * 1000);
                bookingStatus = BookingStatus.CheckedOut;
                const roomIndex = (i + profile.name.charCodeAt(0)) % allRooms.length;
                roomNumber = allRooms[roomIndex].roomCode;
            }
            
            const stayDurationDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            const roomForPrice = allRooms.find(r => r.roomCode === roomNumber) || allRooms[0];

            bookings.push({
                id: `C_${profile.email}_${i}`,
                bookingId: `B${profile.passport.slice(-4)}${i}`,
                fullName: profile.name,
                email: profile.email,
                phone: profile.phone,
                passportId: profile.passport,
                nationality: profile.nationality,
                gender: profile.gender,
                checkInDate: checkInDate.toISOString().split('T')[0],
                checkOutDate: checkOutDate.toISOString().split('T')[0],
                roomStays: [{ roomNumber, bookingStatus }],
                adults: 1 + (i%2),
                children: i % 3,
                guestList: [],
                paymentStatus: 'Paid',
                emailStatus: 'Sent',
                totalPrice: roomForPrice.price * stayDurationDays,
                customerStatus: profile.customerStatus || 'Regular',
                activityStatus: profile.activityStatus || 'Active',
                // Fill other required fields with defaults
                dob: `19${80 + (i%15)}-01-01`,
                guestType: 'Adult',
                currentAddress: '123 Memory Lane',
// FIX: Add 'as VisaType' to ensure type compatibility.
                visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType,
                expireDateOfStay: checkOutDate.toISOString().split('T')[0],
                portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)',
                arrivalCardNumber: `TM${profile.passport.slice(-4)}${i}`,
                relationship: 'Guest',
                tm30Status: TM30Status.Acknowledged,
                occupation: occupations[i % occupations.length],
                arrivingFrom: 'Previous City',
                goingTo: 'Next City',
                issuedBy: `Govt. of ${profile.nationality}`,
                remarks: i === 1 ? 'Returning guest' : '',
            });
        }
    });
    return bookings;
};

// Other specific master customers for different scenarios
// FIX: Define 'today' constant to be used in date calculations.
const today = new Date();
const otherMasterCustomers: Customer[] = [
    // This customer ensures the 'Occupied' status for RM203 and RM301 from masterRooms
    { id: 'C_EW_1', bookingId: 'B_EW_1', fullName: 'Emily White', email: 'emily.white@example.com', roomStays: [{ roomNumber: 'RM203', bookingStatus: BookingStatus.CheckedIn }], checkInDate: '2024-07-29', checkOutDate: '2024-08-05', nationality: 'French', passportId: 'P_EW_123', dob: '1990-01-01', phone: '', guestType: 'Adult' as GuestType, customerStatus: 'Regular' as CustomerStatus, activityStatus: 'Active', currentAddress: '', paymentStatus: 'Paid' as PaymentStatus, emailStatus: 'Sent' as EmailStatus, adults: 1, children: 0, guestList: [], gender: 'Female' as Gender, totalPrice: 14000, visaType: 'Tourist Visa (TR)' as VisaType, expireDateOfStay: '', portOfEntry: '', arrivalCardNumber: '', relationship: '', tm30Status: TM30Status.Pending, occupation: '', arrivingFrom: '', goingTo: '', issuedBy: '', remarks: '' },
// FIX: Add 'as VisaType' to ensure type compatibility.
    { id: 'C_MJ_1', bookingId: 'B_MJ_1', fullName: 'Michael Johnson', email: 'michael.j@example.com', roomStays: [{ roomNumber: 'RM301', bookingStatus: BookingStatus.CheckedIn }], checkInDate: '2024-07-28', checkOutDate: '2024-08-10', nationality: 'American', passportId: 'P_MJ_456', dob: '1985-05-15', phone: '', guestType: 'Adult' as GuestType, customerStatus: 'Blacklisted' as CustomerStatus, activityStatus: 'Inactive', currentAddress: '128 Main St, City, Country', paymentStatus: 'Paid' as PaymentStatus, emailStatus: 'Sent' as EmailStatus, adults: 1, children: 1, guestList: [{ id: 'G_EJ_1', name: 'Emily Johnson', guestType: 'Child' as GuestType, passportId: 'P_EJ_789', nationality: 'American', gender: 'Female' as Gender, dob: '2015-10-10', phone: '', dateOfArrival: '2024-07-28', visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: '', expireDateOfStay: '2024-08-10', relationship: 'Child', occupation: 'Student', currentAddress: '128 Main St, City, Country', arrivingFrom: 'New York, USA', goingTo: 'Bangkok, Thailand', issuedBy: 'Govt. of USA', remarks: '' }], gender: 'Male' as Gender, totalPrice: 32500, visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, expireDateOfStay: '2024-08-10', portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM123456', relationship: 'Guest', tm30Status: TM30Status.Acknowledged, occupation: 'Engineer', arrivingFrom: 'New York, USA', goingTo: 'Bangkok, Thailand', issuedBy: 'Govt. of USA', remarks: '' },
    // This customer ensures the 'Occupied' status for RM302
    { id: 'C_SC_1', bookingId: 'B_SC_1', fullName: 'Sarah Connor', email: 'sarah.connor@example.com', roomStays: [{ roomNumber: 'RM302', bookingStatus: BookingStatus.CheckedIn }], checkInDate: '2024-07-28', checkOutDate: '2024-08-10', nationality: 'American', passportId: 'P_SC_789', dob: '1988-02-20', phone: '', guestType: 'Adult' as GuestType, customerStatus: 'Regular' as CustomerStatus, activityStatus: 'Active', currentAddress: '', paymentStatus: 'Pending' as PaymentStatus, emailStatus: 'Not Sent' as EmailStatus, adults: 1, children: 0, guestList: [], gender: 'Female' as Gender, totalPrice: 32500, visaType: 'Tourist Visa (TR)' as VisaType, expireDateOfStay: '', portOfEntry: '', arrivalCardNumber: '', relationship: '', tm30Status: TM30Status.Pending, occupation: '', arrivingFrom: '', goingTo: '', issuedBy: '', remarks: '' },
    // Other master customers for modal demos
// FIX: Use 'today' and non-mutating date calculations. Add 'as VisaType' for type safety.
    { id: 'C_KJ_1', bookingId: 'B10006', fullName: 'Katie Jones', email: 'katie.jones@example.com', roomStays: [{ roomNumber: 'RM105', bookingStatus: BookingStatus.CheckedIn }], checkInDate: today.toISOString().split('T')[0], checkOutDate: new Date(new Date(today).setDate(today.getDate() + 7)).toISOString().split('T')[0], nationality: 'British', passportId: 'P555666777', dob: '1988-08-08', phone: '(555) 888-9999', guestType: 'Adult' as GuestType, customerStatus: 'Regular' as CustomerStatus, activityStatus: 'Active', currentAddress: '15 Windsor Way, London, UK', paymentStatus: 'Paid' as PaymentStatus, emailStatus: 'Sent' as EmailStatus, adults: 2, children: 1, gender: 'Female' as Gender, totalPrice: 9000, visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, expireDateOfStay: '2025-12-31', portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM888888', relationship: 'Family Head', tm30Status: TM30Status.Acknowledged, occupation: 'Designer', arrivingFrom: 'London, UK', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of UK', remarks: 'Honeymoon trip', guestList: [ { id: 'G_TJ_1', name: 'Tom Jones', guestType: 'Adult' as GuestType, passportId: 'P555666888', nationality: 'British', gender: 'Male' as Gender, dob: '1986-07-12', phone: '', dateOfArrival: today.toISOString().split('T')[0], visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM888889', expireDateOfStay: '2025-12-31', relationship: 'Spouse', occupation: 'Architect', currentAddress: '15 Windsor Way, London, UK', arrivingFrom: 'London, UK', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of UK', remarks: '', }, { id: 'G_JJ_1', name: 'Jerry Jones', guestType: 'Child' as GuestType, passportId: 'P555666999', nationality: 'British', gender: 'Male' as Gender, dob: '2018-02-20', phone: '', dateOfArrival: today.toISOString().split('T')[0], visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM888890', expireDateOfStay: '2025-12-31', relationship: 'Child', occupation: 'Student', currentAddress: '15 Windsor Way, London, UK', arrivingFrom: 'London, UK', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of UK', remarks: '', } ] },
// FIX: Use 'today' and non-mutating date calculations. Add 'as VisaType' for type safety.
    { id: 'C_DD_1', bookingId: 'B10007', fullName: 'David Davis', email: 'david.davis@example.com', roomStays: [{ roomNumber: 'RM401', bookingStatus: BookingStatus.CheckedIn }], checkInDate: today.toISOString().split('T')[0], checkOutDate: new Date(new Date(today).setDate(today.getDate() + 4)).toISOString().split('T')[0], nationality: 'Canadian', passportId: 'P_DD_123', dob: '1982-11-20', phone: '(555) 111-2222', guestType: 'Adult' as GuestType, customerStatus: 'VIP' as CustomerStatus, activityStatus: 'Active', currentAddress: '100 Maple Drive, Toronto, CA', paymentStatus: 'Paid' as PaymentStatus, emailStatus: 'Sent' as EmailStatus, adults: 2, children: 2, gender: 'Male' as Gender, totalPrice: 18000, visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, expireDateOfStay: '2025-12-31', portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM_DD_123', relationship: 'Family Head', tm30Status: TM30Status.Acknowledged, occupation: 'Lawyer', arrivingFrom: 'Toronto, CA', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of Canada', remarks: 'Family vacation', guestList: [ { id: 'G_SD_1', name: 'Sarah Davis', guestType: 'Adult' as GuestType, passportId: 'P_SD_456', nationality: 'Canadian', gender: 'Female' as Gender, dob: '1984-03-15', phone: '', dateOfArrival: today.toISOString().split('T')[0], visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM_SD_456', expireDateOfStay: '2025-12-31', relationship: 'Spouse', occupation: 'Manager', currentAddress: '100 Maple Drive, Toronto, CA', arrivingFrom: 'Toronto, CA', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of Canada', remarks: '' }, { id: 'G_KD_1', name: 'Kevin Davis', guestType: 'Child' as GuestType, passportId: 'P_KD_789', nationality: 'Canadian', gender: 'Male' as Gender, dob: '2014-08-30', phone: '', dateOfArrival: today.toISOString().split('T')[0], visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM_KD_789', expireDateOfStay: '2025-12-31', relationship: 'Child', occupation: 'Student', currentAddress: '100 Maple Drive, Toronto, CA', arrivingFrom: 'Toronto, CA', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of Canada', remarks: '' }, { id: 'G_LD_1', name: 'Lily Davis', guestType: 'Child' as GuestType, passportId: 'P_LD_101', nationality: 'Canadian', gender: 'Female' as Gender, dob: '2016-12-10', phone: '', dateOfArrival: today.toISOString().split('T')[0], visaType: 'Visa Exemption (ยกเว้นวีซ่า)' as VisaType, portOfEntry: 'ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)', arrivalCardNumber: 'TM_LD_101', expireDateOfStay: '2025-12-31', relationship: 'Child', occupation: 'Student', currentAddress: '100 Maple Drive, Toronto, CA', arrivingFrom: 'Toronto, CA', goingTo: 'Phuket, Thailand', issuedBy: 'Govt. of Canada', remarks: '' } ] }
];

const allMasterBookings = [...generateMasterCustomerBookings(), ...otherMasterCustomers];

const generateRandomCustomers = (count: number): Customer[] => {
    // Generates a few extra random customers for variety
    const customers: Customer[] = [];
    // Logic to generate random customers would go here
    return customers;
};

const allCustomers = [...allMasterBookings, ...generateRandomCustomers(15)];

// --- END CUSTOMER DATA ---


const generateUsers = (count: number): User[] => {
    const roles: Role[] = ['Manager', 'Receptionist', 'Cleaner', 'Accountant'];
    const users: User[] = [
      {
        id: 'U100',
        name: 'Admin User',
        email: 'admin@horizon.com',
        role: 'Super Admin',
        status: 'Active',
        lastLogin: 'Today at 9:41 AM',
      }
    ];
    
    for (let i = 0; i < count - 1; i++) {
        const statuses: UserStatus[] = ['Active', 'Pending Invite', 'Inactive'];
        const status = statuses[i % statuses.length];
        const lastLogin = status === 'Active' 
            ? `${i % 3 + 1} days ago` 
            : 'Never';

        users.push({
            id: `U${101 + i}`,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            email: `user${i+1}@hotel.com`,
            role: roles[i % roles.length],
            status: status,
            lastLogin: lastLogin,
        });
    }
    return users;
};

const allUsers = generateUsers(20);

const rolesData: RoleDetails[] = [
    {
        id: 'ROLE_SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Has god-mode access to everything.',
        members: allUsers.filter(u => u.role === 'Super Admin'),
        permissions: {
            bookingManagement: { view: true, create: true, edit: true, delete: true },
            roomManagement: { view: true, create: true, edit: true, delete: true, editStatus: true },
            customerList: { view: true, create: true, edit: true, delete: true, export: true },
            tm30Verification: { view: true, submit: true, verify: true },
            rolesAndPermissions: { view: true, create: true, edit: true, delete: true },
        },
    },
    {
        id: 'ROLE_MANAGER',
        name: 'Manager',
        description: 'Has full access to all system features.',
        members: allUsers.filter(u => u.role === 'Manager'),
        permissions: {
            bookingManagement: { view: true, create: true, edit: true, delete: true },
            roomManagement: { view: true, create: true, edit: true, delete: true, editStatus: true },
            customerList: { view: true, create: true, edit: true, delete: true, export: true },
            tm30Verification: { view: true, submit: true, verify: true },
            rolesAndPermissions: { view: true, create: true, edit: true, delete: true },
        },
    },
    {
        id: 'ROLE_RECEPTIONIST',
        name: 'Receptionist',
        description: 'Handles bookings, customers, and TM.30 submissions.',
        members: allUsers.filter(u => u.role === 'Receptionist'),
        permissions: {
            bookingManagement: { view: true, create: true, edit: true, delete: false },
            roomManagement: { view: true, create: false, edit: false, delete: false, editStatus: false },
            customerList: { view: true, create: true, edit: true, delete: false, export: false },
            tm30Verification: { view: true, submit: true, verify: false },
            rolesAndPermissions: { view: false },
        },
    },
    {
        id: 'ROLE_CLEANER',
        name: 'Cleaner',
        description: 'Can view rooms and update their cleaning status.',
        members: allUsers.filter(u => u.role === 'Cleaner'),
        permissions: {
            bookingManagement: { view: false },
            roomManagement: { view: true, create: false, edit: false, delete: false, editStatus: true },
            customerList: { view: false },
            tm30Verification: { view: false },
            rolesAndPermissions: { view: false },
        },
    },
    {
        id: 'ROLE_ACCOUNTANT',
        name: 'Accountant',
        description: 'Views booking data for financial reporting.',
        members: allUsers.filter(u => u.role === 'Accountant'),
        permissions: {
            bookingManagement: { view: true, create: false, edit: false, delete: false },
            roomManagement: { view: false },
            customerList: { view: true, create: false, edit: false, delete: false, export: true },
            tm30Verification: { view: false },
            rolesAndPermissions: { view: false },
        },
    }
];

export const pendingApprovalsData: PendingApproval[] = [
    { id: 'PA1', userName: 'Sarah Conner', email: 's.conner@test.com', requestedRole: 'Receptionist', dateApplied: '2025-11-25', status: ApprovalStatus.Pending },
    { id: 'PA2', userName: 'John Doe', email: 'j.doe@example.net', requestedRole: 'Manager', dateApplied: '2025-11-24', status: ApprovalStatus.Pending },
    { id: 'PA3', userName: 'Peter Jones', email: 'p.jones@web.co', requestedRole: 'Cleaner', dateApplied: '2025-11-24', status: ApprovalStatus.Pending },
];

export const useMockDataHook = () => {
    const [rooms, setRooms] = useState<Room[]>(allRooms);
    const [customers, setCustomers] = useState<Customer[]>(allCustomers);
    const [users, setUsers] = useState<User[]>(allUsers);
    const [roles, setRoles] = useState<RoleDetails[]>(rolesData);
    const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(pendingApprovalsData);

    const todayStr = new Date().toISOString().split('T')[0];

    const stats = {
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === RoomStatus.Available).length,
        bookedRooms: rooms.filter(r => r.status === RoomStatus.Occupied).length,
        todaysCheckIns: customers.filter(c => c.checkInDate === todayStr).length,
        todaysCheckOuts: customers.filter(c => c.checkOutDate === todayStr).length,
    };

    return {
        stats,
        rooms,
        setRooms,
        customers,
        setCustomers,
        users,
        setUsers,
        roles,
        setRoles,
        pendingApprovals,
        setPendingApprovals,
        visaTypes,
        groupedPortsOfEntry,
    };
};