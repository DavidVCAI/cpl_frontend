import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usersService } from '../services/users';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone number format
      if (!phone.startsWith('+57')) {
        toast.error('El teléfono debe comenzar con +57');
        setLoading(false);
        return;
      }

      if (phone.length < 12) {
        toast.error('Número de teléfono inválido');
        setLoading(false);
        return;
      }

      // Call backend login API
      const response = await usersService.login(phone);
      setUser(response);
      toast.success(`¡Bienvenido de nuevo ${response.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);

      // If user not found, suggest registration
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/register'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🌆 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">CityPulse</span>
          </h1>
          <p className="text-gray-300">Live Civic Engagement - Bogotá</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="+573001234567"
              />
              <p className="mt-1 text-xs text-gray-400">Ingresa el número con el que te registraste</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-sm text-indigo-300 text-center">
            💡 MVP: Usa el mismo teléfono con el que te registraste
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          CityPulse Live © 2024 - Conectando Bogotá en tiempo real
        </p>
      </div>
    </div>
  );
}
