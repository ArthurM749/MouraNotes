import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './AuthContext';
import { AdminProvider } from './AdminContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Post from './pages/Post';
import Admin from './pages/Admin';          // painel admin antigo (senha)
import AdminDashboard from './pages/AdminDashboard'; // novo painel completo
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyPosts from './pages/MyPosts';
import LikedPosts from './pages/LikedPosts';
import WritePage from './pages/WritePage';
import './index.css';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Header />
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/post/:slug"     element={<Post />} />
              <Route path="/admin"          element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/edit-profile"   element={<EditProfile />} />
              <Route path="/my-posts"       element={<MyPosts />} />
              <Route path="/liked-posts"    element={<LikedPosts />} />
              <Route path="/write"          element={<WritePage />} />
            </Routes>
            <ScrollToTop />
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </>
  );
}