import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledContainer = styled(Container)`
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
`;

const GradientText = styled(motion(Typography))`
  background: linear-gradient(45deg, #2196f3, #21cbf3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const NeonButton = styled(motion(Button))`
  background: linear-gradient(45deg, #2196f3 30%, #21cbf3 90%);
  border-radius: 25px;
  box-shadow: 0 3px 5px 2px rgba(33, 203, 243, .3);
  color: white;
  padding: 0 30px;
  height: 48px;
  margin: 8px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  height: 100%;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <StyledContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <GradientText
          variant="h2"
          component={motion.h2}
          variants={itemVariants}
          sx={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          Automated Content Creation Platform
        </GradientText>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h5"
            color="textSecondary"
            align="center"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Transform your retail blog with AI-powered content creation
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <NeonButton
            variant="contained"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </NeonButton>
          <NeonButton
            variant="outlined"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{ background: 'transparent', border: '2px solid #2196f3' }}
          >
            Login
          </NeonButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AutoStoriesIcon sx={{ fontSize: 50, color: '#2196f3', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                AI-Powered Content
              </Typography>
              <Typography color="textSecondary">
                Generate engaging blog posts with advanced AI technology
              </Typography>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <FeatureCard
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <RocketLaunchIcon sx={{ fontSize: 50, color: '#2196f3', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                SEO Optimization
              </Typography>
              <Typography color="textSecondary">
                Automatically optimize content for better search rankings
              </Typography>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <FeatureCard
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUpIcon sx={{ fontSize: 50, color: '#2196f3', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Analytics & Insights
              </Typography>
              <Typography color="textSecondary">
                Track performance and optimize your content strategy
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </motion.div>
    </StyledContainer>
  );
};

export default Home;
