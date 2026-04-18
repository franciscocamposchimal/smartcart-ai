import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
        toast.success('¡Cuenta creada! Bienvenido a SmartCart');
      } else {
        await login(email, password);
        toast.success('¡Bienvenido de vuelta!');
      }
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Redirect is handled by Supabase OAuth – page will reload on return
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión con Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">SmartCart AI</h1>
          <p className="text-gray-500 text-sm mt-1">Tu asistente inteligente de compras</p>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 mb-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          Continuar con Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">o con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary-600 font-medium hover:underline"
          >
            {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </p>
      </div>
    </div>
  );
}
