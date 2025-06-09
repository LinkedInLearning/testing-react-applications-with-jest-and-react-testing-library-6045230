import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Post } from './pages/Post';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePost } from './pages/CreatePost';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

const MainContent = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Navbar />
          <MainContent>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:id" element={<Post />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create" element={<CreatePost />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;