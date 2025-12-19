
export const formatDateToDDMMYYYY = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        
        // Using getUTC functions to avoid timezone off-by-one errors with 'YYYY-MM-DD' strings
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        
        if (isNaN(year) || year < 1900) return ''; // Basic validation

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Invalid date for formatting:", dateString);
        return String(dateString); 
    }
};
