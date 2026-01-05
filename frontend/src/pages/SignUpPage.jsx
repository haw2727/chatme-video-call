import React, { useState } from 'react';
import { MessageSquare, Eye, EyeOff, Mail, Lock, User, MapPin, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSignup } from '../hooks/useSignup';

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: signupMutation, isPending, error } = useSignup();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    signupMutation(formData);
  };

  const isFormValid = formData.fullName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-base-100 to-primary/10 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Illustration */}
          <div className="hidden lg:block order-2 lg:order-1">
            <div className="text-center">
              <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full blur-3xl"></div>
                <img
                  src="/1.png"
                  alt="Join Community Illustration"
                  className="relative w-full h-auto max-w-md mx-auto"
                />
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold text-base-content">
                  Join our growing community
                </h3>
                <p className="text-base-content/70 text-lg max-w-md mx-auto">
                  Create your account and start connecting with people from around the world.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
            <div className="bg-base-100 rounded-2xl shadow-xl p-8 border border-base-300">

              {/* Logo */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-secondary" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    ChatMe
                  </h1>
                </div>
                <h2 className="text-2xl font-semibold text-base-content mb-2">Create Account</h2>
                <p className="text-base-content/70">
                  Join the conversation today
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 alert alert-error">
                  <span>{error?.response?.data?.message || error?.message || 'Signup failed. Please try again.'}</span>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">

                {/* Full Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name *</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      className="input input-bordered w-full pl-12 focus:input-secondary"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email Address *</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="input input-bordered w-full pl-12 focus:input-secondary"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password *</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      className="input input-bordered w-full pl-12 pr-12 focus:input-secondary"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Confirm Password *</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      className={`input input-bordered w-full pl-12 pr-12 focus:input-secondary ${formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'input-error'
                          : ''
                        }`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">Passwords do not match</span>
                    </label>
                  )}
                </div>

                {/* Bio (Optional) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Bio (Optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-base-content/40" />
                    <textarea
                      name="bio"
                      placeholder="Tell us about yourself..."
                      className="textarea textarea-bordered w-full pl-12 focus:textarea-secondary resize-none"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Location (Optional) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Location (Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type="text"
                      name="location"
                      placeholder="Where are you from?"
                      className="input input-bordered w-full pl-12 focus:input-secondary"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  className="btn btn-secondary w-full text-white mt-6"
                  disabled={isPending || !isFormValid}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-base-content/70">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-secondary hover:text-secondary-focus font-semibold hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;