import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const StyledPaper = styled(motion(Paper))`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
`;

const StyledContainer = styled(Container)`
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
`;

const StyledButton = styled(motion(Button))`
  margin-top: 1rem;
  background: linear-gradient(45deg, #1976d2 30%, #2196f3 90%);
  box-shadow: 0 3px 5px 2px rgba(33, 150, 243, 0.3);
  border-radius: 25px;
  color: #ffffff;
  padding: 0 30px;
  height: 48px;
  font-weight: 500;

  &:hover {
    background: linear-gradient(45deg, #1565c0 30%, #1976d2 90%);
  }
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 12px;
    
    &:hover fieldset {
      border-color: #2196f3;
    }
  }
  
  & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #1976d2;
  }
`;

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password, true);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <StyledContainer maxWidth="xs">
      <StyledPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <StyledTextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />
          <StyledButton
            type="submit"
            fullWidth
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Admin Sign In
          </StyledButton>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default AdminLogin;
