import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const passwordStrength = useMemo(() => {
        let score = -1;
        if (password.length > 0) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score > 3) score = 3;
        if (password.length === 0) score = -1;

        return { score };
    }, [password]);

    if (passwordStrength.score < 0) {
        return <div className="h-2 mt-2"></div>; // Keep layout consistent
    }

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
    
    return (
        <div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength.score]}`}
                    style={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
                Strength: <span className="font-semibold">{strengthLabels[passwordStrength.score]}</span>
            </p>
        </div>
    );
};

export default PasswordStrengthIndicator;
