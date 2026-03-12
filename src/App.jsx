import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Post from './pages/Post';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <ScrollToTop />
      </BrowserRouter>
      <Analytics />
    </>
  );
}