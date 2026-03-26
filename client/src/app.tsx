import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './providers/UserProvider';
import { AxiosProvider } from './providers/AxiosProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ExamProvider } from './providers/ExamProvider';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StoresPage } from './pages/StoresPage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { MyStorePage } from './pages/MyStorePage';

function AppRoutes() {
  const { auth } = useUser();

  const defaultRedirect = auth
    ? auth.user.role === 'store' ? '/my-store' : '/stores'
    : '/login';

  return (
    <Routes>
      <Route path="/login" element={!auth ? <LoginPage /> : <Navigate to={defaultRedirect} />} />
      <Route path="/register" element={!auth ? <RegisterPage /> : <Navigate to={defaultRedirect} />} />
      <Route path="/stores" element={auth ? <StoresPage /> : <Navigate to="/login" />} />
      <Route path="/stores/:id" element={auth ? <StoreDetailPage /> : <Navigate to="/login" />} />
      <Route path="/my-store" element={auth ? <MyStorePage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={defaultRedirect} />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ExamProvider>
        <UserProvider>
          <AxiosProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AxiosProvider>
        </UserProvider>
      </ExamProvider>
    </BrowserRouter>
  );
}
