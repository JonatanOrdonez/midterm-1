import { useState } from 'preact/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../providers/UserProvider';
import { useAxios } from '../providers/AxiosProvider';
import { useToast } from '../providers/ToastProvider';
import type { UserRole, UserWithToken } from '../types';

export function RegisterPage() {
  const { setAuth } = useUser();
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [store_name, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<UserWithToken>('/api/auth/register', {
        email,
        password,
        role,
        ...(role === 'store' && { store_name }),
      });
      setAuth(data);
      navigate(data.user.role === 'store' ? '/my-store' : '/stores');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al registrarse', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Crear cuenta</h1>

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
          <select
            value={role}
            onChange={(e) => setRole((e.target as HTMLSelectElement).value as UserRole)}
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="consumer">Consumidor</option>
            <option value="store">Tienda</option>
          </select>

          {role === 'store' && (
            <input
              type="text"
              placeholder="Nombre de tu tienda"
              value={store_name}
              onInput={(e) => setStoreName((e.target as HTMLInputElement).value)}
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            class="bg-purple-600 text-white rounded-lg py-2 font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <p class="text-sm text-gray-500 text-center mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" class="text-purple-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
