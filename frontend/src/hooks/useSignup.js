import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';
import { ErrorHandler, validateEmail, validatePassword, validateFirstName, validateLastName } from '../lib/errorHandler';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const useSignup = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (signupData) => {
            // Client-side validation
            const emailError = validateEmail(signupData.email);
            const passwordError = validatePassword(signupData.password);
            const firstNameError = validateFirstName(signupData.firstName);
            const lastNameError = validateLastName(signupData.lastName);

            if (emailError) throw new Error(emailError);
            if (passwordError) throw new Error(passwordError);
            if (firstNameError) throw new Error(firstNameError);
            if (lastNameError) throw new Error(lastNameError);

            if (signupData.password !== signupData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            return signup(signupData);
        },
        onSuccess: (data) => {
            // Set auth data and navigate
            queryClient.setQueryData(['authUser'], data);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });

            // Navigate to home page
            navigate('/', { replace: true });

            // Show success message
            showToast.success('Account created successfully! Welcome to ChatMe!');
        },
        onError: (error) => {
            ErrorHandler.showToast(error, 'signup');
        }
    });
};