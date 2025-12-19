
import React, { createContext, useContext } from 'react';
import { Room, Customer, User, RoleDetails, PendingApproval, VisaType, PortOfEntry } from '../types';
import { useMockDataHook } from '../hooks/useMockData';

// This defines the shape of the data and setters that will be available in the context.
export type DataContextType = ReturnType<typeof useMockDataHook>;

export const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
