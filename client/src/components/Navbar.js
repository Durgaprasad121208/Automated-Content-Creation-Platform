import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const StyledAppBar = styled(AppBar)`
  background: linear-gradient(45deg, #2196f3 30%, #21cbf3 90%);
  box-shadow: 0 3px 5px 2px rgba(33, 203, 243, .3);
`;

const NavButton = styled(motion(Button))`
  margin: 0 8px;
  color: #ffffff;
  border: 2px solid transparent;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  
  &:hover {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.25);
    border-color: #ffffff;
  }
`;

const LogoText = styled(motion(Typography))`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
  font-size: 1.5rem;
`;

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <LogoText
          variant="h6"
          component={Link}
          to="/"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Retail Blog Platform
        </LogoText>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <NavButton
            component={Link}
            to="/"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Home
          </NavButton>
        </Box>

        <Box>
          {!user ? (
            <>
              <NavButton
                component={Link}
                to="/login"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Login
              </NavButton>
              <NavButton
                component={Link}
                to="/register"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Register
              </NavButton>
              <NavButton
                component={Link}
                to="/admin/login"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Admin Login
              </NavButton>
            </>
          ) : (
            <>
              <NavButton
                component={Link}
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Dashboard
              </NavButton>
              <NavButton
                onClick={handleLogout}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Logout
              </NavButton>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
