import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      if (!/[A-Z]/.test(formData.password)) {
        toast.error('Password must contain at least one uppercase letter');
        setLoading(false);
        return;
      }

      if (!/[a-z]/.test(formData.password)) {
        toast.error('Password must contain at least one lowercase letter');
        setLoading(false);
        return;
      }

      if (!/[0-9]/.test(formData.password)) {
        toast.error('Password must contain at least one number');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.name.length < 2) {
        toast.error('Please enter your name');
        setLoading(false);
        return;
      }

      // Register with Cognito
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone_number: formData.phone_number || undefined,
      });

      toast.success('Account created! Check your email for verification code.');
      setStep('verify');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!verificationCode || verificationCode.length < 6) {
        toast.error('Please enter the 6-digit verification code');
        setLoading(false);
        return;
      }

      await authService.confirmEmail(formData.email, verificationCode);

      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Verification failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.resendConfirmationCode(formData.email);
      toast.success('New verification code sent to your email');
    } catch (error: any) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                CityPulse
              </span>
            </h1>
            <p className="text-gray-300">Verify Your Email</p>
          </div>

          {/* Verification Form */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
              <p className="text-gray-400 mt-2">
                We sent a verification code to <br />
                <span className="text-indigo-400">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  Resend Code
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('register')}
                className="text-gray-500 hover:text-gray-400 text-sm transition"
              >
                &larr; Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              CityPulse
            </span>
          </h1>
          <p className="text-gray-300">Live Civic Engagement - Bogota</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone Input (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Phone Number{' '}
                <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="+573001234567"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-12"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="********"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-300 text-center">
            Secured with AWS Cognito - Your data is protected
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          CityPulse Live - Connecting Bogota in real-time
        </p>
      </div>
    </div>
  );
}
