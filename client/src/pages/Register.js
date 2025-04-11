import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import HowToRegIcon from '@mui/icons-material/HowToReg';

const StyledPaper = styled(motion(Paper))`
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 400px;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const StyledContainer = styled(Container)`
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 2rem;
`;

const StyledForm = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const StyledButton = styled(motion(Button))`
  margin-top: 1.5rem;
  background: linear-gradient(45deg, #1976d2 30%, #2196f3 90%);
  box-shadow: 0 3px 5px 2px rgba(33, 150, 243, 0.3);
  border-radius: 25px;
  color: #ffffff;
  padding: 0.75rem 2rem;
  height: 48px;
  font-weight: 500;
  text-transform: none;
  font-size: 1.1rem;

  &:hover {
    background: linear-gradient(45deg, #1565c0 30%, #1976d2 90%);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const StyledTextField = styled(TextField)`
  margin: 0.5rem 0;

  & .MuiOutlinedInput-root {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    &.Mui-focused fieldset {
      border-color: #90caf9;
    }
  }

  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
    
    &.Mui-focused {
      color: #90caf9;
    }
  }

  & .MuiInputAdornment-root {
    color: rgba(255, 255, 255, 0.7);
    margin-right: 0.5rem;
  }

  & input {
    color: #ffffff;
    padding: 0.75rem 0.5rem;
  }
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // toast.error('Passwords do not match!');
      return;
    }
    const success = await register(username, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <StyledContainer maxWidth="xs">
      <StyledPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center"
          sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            marginBottom: 3,
            fontSize: '2rem',
            letterSpacing: '0.5px'
          }}
        >
          Create Account
        </Typography>
        <StyledForm component="form" onSubmit={handleSubmit}>
          <StyledTextField
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <StyledTextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <StyledTextField
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <StyledTextField
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <StyledButton
            type="submit"
            fullWidth
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            endIcon={<HowToRegIcon />}
          >
            Register
          </StyledButton>
        </StyledForm>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Register;
