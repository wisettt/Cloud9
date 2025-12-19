import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const passwordStrengthScore = useMemo(() => {
        let score = -1;
        if (newPassword.length > 0) score++;
        if (newPassword.length >= 8) score++;
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
        if(score > 3) score = 3;
        return score;
    }, [newPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!newPassword || !confirmPassword || !currentPassword) {
            setError('All fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (passwordStrengthScore < 2) {
            setError('New password is not strong enough.');
            return;
        }

        // Mock API call to check current password and update
        if (currentPassword !== 'password123') { // Mock current password check
            setError('The current password you entered is incorrect.');
            return;
        }

        // Success
        alert('Password updated successfully!');
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordInput
                    id="current-password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoFocus
                />
                <div>
                    <PasswordInput
                        id="new-password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <PasswordStrengthIndicator password={newPassword}/>
                </div>
                <PasswordInput
                    id="confirm-password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                
                <div className="flex justify-end pt-4 space-x-2 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Update Password
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
