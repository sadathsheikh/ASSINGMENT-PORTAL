import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Determine default redirect path based on user role
  const getDefaultPath = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student routes */}
      <Route 
        path="/student-dashboard" 
        element={
          <PrivateRoute requiredRole="student">
            <StudentDashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Teacher routes */}
      <Route 
        path="/teacher-dashboard" 
        element={
          <PrivateRoute requiredRole="teacher">
            <TeacherDashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Redirect based on role */}
      <Route 
        path="*" 
        element={<Navigate to={getDefaultPath()} state={{ from: location }} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Navbar />
        <Box flex="1" py={6}>
          <Container maxW="container.xl">
            <AppRoutes />
          </Container>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;