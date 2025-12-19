export enum RoomStatus {
    Available = 'Available',
    Occupied = 'Occupied',
    Cleaning = 'Cleaning',
    Maintenance = 'Maintenance',
}

export type RoomType = 'Standard' | 'Superior' | 'Deluxe' | 'Connecting';
export type BedType = 'King Bed' | 'Queen Bed' | 'Twin Bed' | 'Single Bed';

export interface Room {
    id: string;
    roomCode: string;
    floor: string;
    floorAndview: string;
    internalNotes: string;
    type: RoomType;
    bedType: BedType;
    price: number;
    status: RoomStatus;
    maxOccupancy: number;
    description: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Deposit Paid';
export type EmailStatus = 'Sent' | 'Not Sent';

export type Gender = 'Male' | 'Female' | 'Other';
export type GuestType = 'Adult' | 'Child' | 'Infant';


export enum BookingStatus {
    Confirmed = 'Confirmed',
    Pending = 'Pending',
    CheckedIn = 'Checked-In',
    CheckedOut = 'Checked-Out',
    Cancelled = 'Cancelled',
}

export interface RoomStay {
    roomNumber: string;
    bookingStatus: BookingStatus;
}

export interface Guest {
    id: string;
    name: string;
    passportId: string;
    nationality: string;
    gender: Gender;
    dob: string;
    phone: string;
    guestType: GuestType;
    dateOfArrival: string;
    visaType: VisaType;
    portOfEntry: PortOfEntry;
    arrivalCardNumber: string;
    expireDateOfStay: string;
    relationship: string;
    // New R.R.4 fields
    occupation: string;
    currentAddress: string;
    arrivingFrom: string;
    goingTo: string;
    issuedBy: string;
    remarks: string;
}

export type VisaType = 
    'Visa Exemption (ยกเว้นวีซ่า)' |
    'Visa on Arrival (VOA)' |
    'Tourist Visa (TR)' |
    'Non-Immigrant (NON-B)' |
    'Non-Immigrant (NON-ED)' |
    'Non-Immigrant (NON-O)' |
    'Non-Immigrant (NON-O-A)' |
    'LTR Visa' |
    'SMART Visa' |
    'อื่นๆ (Others)';

export type PortOfEntry = string;

export enum TM30Status {
    Pending = 'Pending Submission',
    Submitted = 'Submitted',
    Acknowledged = 'Acknowledged',
}

export type CustomerStatus = 'Regular' | 'VIP' | 'Blacklisted';
export type CustomerActivityStatus = 'Active' | 'Inactive';

export interface Customer {
    id: string;
    bookingId: string;
    fullName: string;
    nationality: string;
    passportId: string;
    dob: string;
    phone: string;
    email: string;
    guestType: GuestType;
    customerStatus: CustomerStatus;
    activityStatus: CustomerActivityStatus;
    currentAddress: string; // Renamed from address
    checkInDate: string; // Used for Date of Arrival
    checkOutDate: string;
    roomStays: RoomStay[];
    paymentStatus: PaymentStatus;
    emailStatus: EmailStatus;
    adults: number;
    children: number;
    guestList: Guest[];
    gender: Gender;
    totalPrice: number;
    // New immigration fields
    visaType: VisaType;
    expireDateOfStay: string;
    portOfEntry: PortOfEntry;
    arrivalCardNumber: string;
    relationship: string;
    tm30Status: TM30Status;
    // New R.R.4 fields
    occupation: string;
    arrivingFrom: string;
    goingTo: string;
    issuedBy: string;
    remarks: string;
}

export type UserStatus = 'Active' | 'Pending Invite' | 'Inactive';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: UserStatus;
    lastLogin: string;
}

export type Role = 'Super Admin' | 'Manager' | 'Receptionist' | 'Cleaner' | 'Accountant';

export interface PermissionActions {
    view: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    editStatus?: boolean; // For rooms
    submit?: boolean;     // For TM30
    verify?: boolean;     // For TM30
    export?: boolean;     // For Customers
}

export interface RolePermissions {
    bookingManagement: PermissionActions;
    roomManagement: PermissionActions;
    customerList: PermissionActions;
    tm30Verification: PermissionActions;
    rolesAndPermissions: PermissionActions;
}


export interface RoleDetails {
    id: string;
    name: Role;
    description: string;
    members: User[];
    permissions: RolePermissions;
}

export enum ApprovalStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export interface PendingApproval {
    id: string;
    userName: string;
    email: string;
    requestedRole: Role;
    dateApplied: string;
    status: ApprovalStatus;
}

export type SettingsCategory = 'general' | 'users' | 'email' | 'security';