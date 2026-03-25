import { useEffect, useState } from 'preact/hooks';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../providers/AxiosProvider';
import type { Store } from '../types';

export function MyStorePage() {
  const axios = useAxios();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get<Store>('/api/stores/mine')
      .then(({ data }) => navigate(`/stores/${data.id}`, { replace: true }))
      .catch(() => setError('No se encontró tu tienda.'));
  }, [axios, navigate]);

  if (error) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <p class="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-gray-400">Cargando tu tienda...</p>
    </div>
  );
}
