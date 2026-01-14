import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { checkSession } from './store/slices/authSlice';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import { BlogList } from './pages/BlogList';
import { BlogView } from './pages/BlogView';
import { BlogCreate } from './pages/BlogCreate';
import { BlogEdit } from './pages/BlogEdit';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is already logged in
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/blogs" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  <Logout />
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:id" element={<BlogView />} />
            <Route
              path="/blogs/create"
              element={
                <ProtectedRoute>
                  <BlogCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blogs/edit/:id"
              element={
                <ProtectedRoute>
                  <BlogEdit />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  main: {
    minHeight: 'calc(100vh - 80px)',
  },
};

export default App;
