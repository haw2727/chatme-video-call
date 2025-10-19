
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api.js';

function SignUpPage() {
    // form state
    const [signupData, setSignUpData] = useState({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    const queryClient = useQueryClient();

  const { mutate:signupMutation, isLoading,error } = useMutation({
      mutationFn: signup,
      onSuccess: () => queryClient.invalidateQueries({queryKey: ['authUser']}), 
  
    });

    // handle input changes
    const handleSignupChange = (e) => {
      const { name, value, type, checked } = e.target;
      // For checkboxes, use checked, otherwise value
      const val = type === 'checkbox' ? checked : value;
      setSignUpData(prev => ({ ...prev, [name]: val }));
    };
    
    // handle form submit
    const handleSignupSubmit = (e) => {
      e.preventDefault();
      signupMutation(signupData);
     
    };
  return (
    <div className='flex items-center justify-center h-screen p-4 sm:p-8' data-theme="forest">
      <div className='flex flex-col w-full max-w-5xl mx-auto overflow-hidden border shadow-lg border-primary/25 lg:flex-row bg-base-100 rounded-xl'>
        {/* Signup Form - Left Side - Image */}

        <div className='flex-col items-center justify-center w-full p-4 lg:w-1/2 sm:p-8'>
           {/* Logo Image */}
            <div className='flex items-center justify-start gap-2 mb-8'>
                <MessageSquare className='w-9 h-9 text-primary'/>
                <span className='font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary'>
                  ChatMe
                </span>
            </div>
            {/** Display error message if any */}
            {error && (
              <div className ='mb-4 alert alert-error'>
                <span>{error.response.data.message || 'An error occurred during signup.'}</span>
              </div>
            )}

            <div className='w-full '>
              <form onSubmit={handleSignupSubmit}>
                <div className='space-y-4'>
                  <div>
                    <h2 className='text-2xl font-bold'>Create an Account</h2>
                    <p className='text-sm opacity-80'>Please fill in the details to create an account.</p>
                  </div>
                  <div className='space-y-3'>
                    {/** Full Name Field */}
                    <div className='w-full form-control'>
                      <label className ='label'>
                        <span className='label-text'>Full Name</span>
                      </label>
                      <input name="fullName" type="text" placeholder='jeo max' 
                      className="w-full input-border" 
                      value={signupData.fullName} 
                      onChange={handleSignupChange}
                       required
                       />
                    </div>
                    {/** Email Field */}
                    <div className='w-full form-control'>
                      <label className ='label'>
                        <span className='label-text'>Email</span>
                      </label>
                      <input name="email" type="email" placeholder='je@example.com' 
                      className="w-full input-border" 
                      value={signupData.email} 
                      onChange={handleSignupChange}
                       required
                       />
                    </div>
                    {/** Password Field */}
                    <div className='w-full form-control'>
                      <label className ='label'>
                        <span className='label-text'>Password</span>
                      </label>
                      <input name="password" type="password" placeholder='........' 
                      className="w-full input-border" 
                      value={signupData.password} 
                      onChange={handleSignupChange}
                       required
                       />
                     <p className='mt-1 text-xs opacity-70'>
                      Must be at least 8 characters.
                      </p>
                    </div>
                    {/** Confirm Password Field */}
                    <div className='w-full form-control'>
                      <label className ='label'>
                        <span className='label-text'>Confirm Password</span>
                      </label>
                      <input name="confirmPassword" type="password" placeholder='........' 
                      className="w-full input-border" 
                      value={signupData.confirmPassword} 
                      onChange={handleSignupChange}
                       required
                       />
                    </div>

                    {/** Agreement Checkbox */}
                    <div className='w-full form-control'>
                      <label className='justify-start gap-2 cursor-pointer label'>
                        <input type="checkbox" className="checkbox" required />
                        <span className='text-xs leading-tight'>
                          I agree to the{" "}
                          </span>
                          <span className='text-primary hover:underline'>Terms and Conditions</span> and{" "}
                          <span className='text-primary hover:underline'>Privacy Policy</span>.
                      </label>
                    </div>
                    {/** Submit Button */}
                    <button type='submit' disabled={isLoading} className='w-full btn btn-primary'>
                      {isLoading ? (
                        /** Loading Spinner */
                        <>
                        <span className='loading loading-spinner loading-xs'></span>
                        Loading...
                        </>
                      ) : ('Create Account')}
                      </button>
                    {/** Password Mismatch Inline Error */}
                    {signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                      <p className='mt-2 text-sm text-red-400'>Passwords do not match</p>
                    )}
                    {/** Redirect to Login */}
                    <div className='mt-4 text-center opacity-80'>
                      Already have an account?{" "}
                      <Link to="/login" className='text-primary hover:underline'>Log in</Link>
                    </div>
                  </div>
                </div>
              </form>
            </div>
        </div>
       
      {/* Right-side illustration: hidden on small, visible on lg+ */}
      <div className='items-center justify-center hidden lg:flex lg:w-1/2 bg-primary/10'>
        <div className="max-w-md p-8">
            {/**Illustration */}
            <div className='relative max-w-sm mx-auto aspect-square'>
              <img src="/1.png" alt="Illustration" className='object-contain w-full h-full' />
            </div>
          
          {/** Heading and Subheading */}  
          <div className='mt-6 space-y-3 text-center'>
            <h2 className='text-xl font-semibold'>Join Us Today</h2>
            <p className='opacity-70'>Create an account to enjoy all our features.</p>
          </div>
         </div>
        </div>

      </div>
      
    </div>
  )
}

export default SignUpPage