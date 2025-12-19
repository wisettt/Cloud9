
import React from 'react';
import Modal from './ui/Modal';
import { Room, RoomStatus } from '../types';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

interface RoomDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | null;
    currentGuest?: string;
    checkOutDate?: string;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-bold leading-6 text-black">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-black sm:col-span-2 sm:mt-0 flex items-center">{children}</dd>
    </div>
);

const getStatusBadge = (status: RoomStatus) => {
    const statusClasses = {
        [RoomStatus.Available]: "bg-green-100 text-green-800",
        [RoomStatus.Occupied]: "bg-red-100 text-red-800",
        [RoomStatus.Cleaning]: "bg-blue-100 text-blue-800",
        [RoomStatus.Maintenance]: "bg-gray-100 text-gray-800",
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[100px] inline-block text-center ${statusClasses[status]}`}>{status}</span>;
};


const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ isOpen, onClose, room, currentGuest, checkOutDate }) => {
    if (!room) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Room Details`}>
            <div>
                 <div className="border-t border-gray-200">
                    <dl className="divide-y divide-gray-200">
                        <DetailItem label="Room Number">
                            <span className="font-bold text-lg text-black">{room.roomCode}</span>
                        </DetailItem>
                        <DetailItem label="Room Type">
                             {room.type}
                        </DetailItem>
                        <DetailItem label="Status">
                            {getStatusBadge(room.status)}
                        </DetailItem>
                        <DetailItem label="Max Occupancy">
                             {`${room.maxOccupancy} Persons`}
                        </DetailItem>
                        
                        {room.status === RoomStatus.Occupied && (
                            <>
                                <div className="py-2 col-span-full -mx-6 px-6 mt-2 border-t">
                                    <h4 className="text-sm font-semibold text-blue-800 bg-blue-50 -mx-6 px-6 py-2 border-y">Guest Information</h4>
                                </div>
                                <DetailItem label="Current Guest">
                                    {currentGuest || '—'}
                                </DetailItem>
                                <DetailItem label="Check-Out Date">
                                    {formatDateToDDMMYYYY(checkOutDate) || '—'}
                                </DetailItem>
                            </>
                        )}
                    </dl>
                </div>
            </div>
        </Modal>
    );
};

export default RoomDetailsModal;
