import { useEffect, useState } from 'preact/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../providers/AxiosProvider';
import { useUser } from '../providers/UserProvider';
import { useToast } from '../providers/ToastProvider';
import type { StoreWithProducts } from '../types';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const axios = useAxios();
  const { auth, setAuth } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [store, setStore] = useState<StoreWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const isOwner = !!store && auth?.user.id === store.userId;

  useEffect(() => {
    axios.get<StoreWithProducts>(`/api/stores/${id}`)
      .then(({ data }) => setStore(data))
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Error al cargar la tienda', 'error'))
      .finally(() => setLoading(false));
  }, [axios, id]);

  const toggleOpen = async () => {
    if (!store) return;
    try {
      const { data } = await axios.patch<StoreWithProducts>(`/api/stores/${store.id}`, {
        isOpen: !store.isOpen,
      });
      setStore({ ...data, products: store.products });
      showToast(data.isOpen ? 'Tienda abierta' : 'Tienda cerrada', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar la tienda', 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!store) return;
    try {
      await axios.delete(`/api/stores/${store.id}/products/${productId}`);
      setStore({ ...store, products: store.products.filter((p) => p.id !== productId) });
      showToast('Producto eliminado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar el producto', 'error');
    }
  };

  const handleAddProduct = async (e: Event) => {
    e.preventDefault();
    if (!store) return;
    setAddingProduct(true);
    try {
      const { data } = await axios.post(`/api/stores/${store.id}/products`, {
        name: productName,
        price: parseFloat(productPrice),
      });
      setStore({ ...store, products: [...store.products, data] });
      setProductName('');
      setProductPrice('');
      showToast('Producto agregado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al agregar el producto', 'error');
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <p class="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <button onClick={() => navigate(-1)} class="text-gray-400 hover:text-gray-600 text-sm">
            ← Volver
          </button>
          <h1 class="text-xl font-semibold text-gray-800">{store.name}</h1>
          <span class={`text-xs px-2 py-1 rounded-full font-medium ${store.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
            {store.isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>
        <div class="flex items-center gap-3">
          {isOwner && (
            <button
              onClick={toggleOpen}
              class={`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${store.isOpen ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {store.isOpen ? 'Cerrar tienda' : 'Abrir tienda'}
            </button>
          )}
          <button onClick={() => setAuth(null)} class="text-sm text-red-500 hover:underline">
            Salir
          </button>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        {isOwner && (
          <section class="bg-white rounded-2xl shadow p-6">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Agregar producto</h2>
            <form onSubmit={handleAddProduct} class="flex gap-3">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={productName}
                onInput={(e) => setProductName((e.target as HTMLInputElement).value)}
                class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={productPrice}
                onInput={(e) => setProductPrice((e.target as HTMLInputElement).value)}
                class="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                disabled={addingProduct}
                class="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Agregar
              </button>
            </form>
          </section>
        )}

        <section>
          <h2 class="text-lg font-medium text-gray-800 mb-4">Productos</h2>
          {store.products.length === 0 ? (
            <p class="text-gray-400">No hay productos en esta tienda.</p>
          ) : (
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {store.products.map((product) => (
                <div key={product.id} class="bg-white rounded-2xl shadow p-4 flex justify-between items-center">
                  <span class="font-medium text-gray-800">{product.name}</span>
                  <div class="flex items-center gap-3">
                    <span class="text-purple-600 font-semibold">${product.price}</span>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        class="text-red-400 hover:text-red-600 text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
