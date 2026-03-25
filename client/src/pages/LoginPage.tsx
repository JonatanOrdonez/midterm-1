import { useState } from 'preact/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../providers/UserProvider';
import { useAxios } from '../providers/AxiosProvider';
import { useToast } from '../providers/ToastProvider';
import type { UserWithToken } from '../types';

const DEMO_USERS = [
  { label: 'Consumidor', email: 'customer@email.com', password: '123456', role: 'consumer' },
  { label: 'Tienda', email: 'store@email.com', password: '123456', role: 'store' },
];

export function LoginPage() {
  const { setAuth } = useUser();
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<UserWithToken>('/api/auth/login', { email, password });
      setAuth(data);
      navigate(data.user.role === 'store' ? '/my-store' : '/stores');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Iniciar sesión</h1>

        <div class="mb-6">
          <p class="text-xs text-gray-400 text-center mb-2">Iniciar sesión como</p>
          <div class="flex flex-col gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => { setEmail(u.email); setPassword(u.password); }}
                class="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <span class="font-medium text-gray-700">{u.label}</span>
                <span class="text-gray-400">{u.email}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} class="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            class="bg-purple-600 text-white rounded-lg py-2 font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <p class="text-sm text-gray-500 text-center mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/register" class="text-purple-600 hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
