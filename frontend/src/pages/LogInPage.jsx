import React, { useState } from 'react';
import { MessageSquare, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

function LogInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginMutation, isPending, error } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-base-100 rounded-2xl shadow-xl p-8 border border-base-300">

              {/* Logo */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ChatMe
                  </h1>
                </div>
                <h2 className="text-2xl font-semibold text-base-content mb-2">Welcome back!</h2>
                <p className="text-base-content/70">
                  Sign in to continue your conversations
                </p>
              </div>

              {/* Test Credentials Info */}
              <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-lg">
                <h3 className="font-semibold text-info mb-2">Test Credentials:</h3>
                <p className="text-sm text-info/80">
                  <strong>Email:</strong> test@example.com<br />
                  <strong>Password:</strong> password123
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 alert alert-error">
                  <span>{error?.response?.data?.message || error?.message || 'Login failed. Please try again.'}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="input input-bordered w-full pl-12 focus:input-primary"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="input input-bordered w-full pl-12 pr-12 focus:input-primary"
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

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full text-white"
                  disabled={isPending || !formData.email || !formData.password}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Signup Link */}
                <div className="text-center pt-4">
                  <p className="text-base-content/70">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary hover:text-primary-focus font-semibold hover:underline"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="hidden lg:block">
            <div className="text-center">
              <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                <img
                  src="/1.png"
                  alt="Chat Illustration"
                  className="relative w-full h-auto max-w-md mx-auto"
                />
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold text-base-content">
                  Connect with friends worldwide
                </h3>
                <p className="text-base-content/70 text-lg max-w-md mx-auto">
                  Join millions of users in seamless conversations, share moments, and build lasting connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogInPage;