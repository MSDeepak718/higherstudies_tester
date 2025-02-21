import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('token');
  let isFaculty = false; 

  if (isAuthenticated) {
    const decodedToken = jwtDecode(isAuthenticated);
    isFaculty = (decodedToken.persona === 'faculty');
    console.log(isFaculty)
  }

  return isFaculty ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
