import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import DownloadIcon from '@mui/icons-material/Download';
import DOMPurify from 'dompurify';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
  Tab,
  Tabs,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

const StyledContainer = styled(Container)`
  padding: 2rem;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
`;

const StyledPaper = styled(motion(Paper))`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
`;

const StyledButton = styled(motion(Button))`
  //background: linear-gradient(45deg, #1976d2 30%, #2196f3 90%);
  box-shadow: 0 3px 5px 2px rgba(33, 150, 243, 0.3);
  border-radius: 25px;
  color: #ffffff;
  padding: 0 30px;
  height: 48px;
  margin: 8px;
  font-weight: 500;

  &:hover {
    background: linear-gradient(45deg, #1976d2 30%, #2196f3 90%);
  }
`;


const BlogCard = styled(motion(Card))`
  margin: 1rem 0;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
`;

const BlogPreviewContainer = styled.div`
  .blog-content {
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #2d3748;
  }
  .blog-heading {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a202c;
    margin: 2rem 0 1.5rem;
    line-height: 1.2;
  }
  .blog-subheading {
    font-size: 2rem;
    font-weight: 600;
    color: #2d3748;
    margin: 2rem 0 1rem;
  }
  .blog-section {
    font-size: 1.5rem;
    font-weight: 500;
    color: #4a5568;
    margin: 1.5rem 0 1rem;
  }
  .blog-paragraph {
    font-size: 1.125rem;
    margin: 1.25rem 0;
    color: #4a5568;
  }
  .blog-list, .blog-ordered-list {
    margin: 1rem 0;
    padding-left: 2rem;
    list-style-position: outside;
  }
  .blog-list {
    list-style-type: disc;
  }
  .blog-ordered-list {
    list-style-type: decimal;
  }
  .blog-list li, .blog-ordered-list li {
    margin: 0.5rem 0;
    line-height: 1.6;
    padding-left: 0.5rem;
  }
  .blog-quote {
    border-left: 4px solid #4299e1;
    padding: 1rem 2rem;
    margin: 1.5rem 0;
    background-color: #f7fafc;
    font-style: italic;
  }
  strong {
    color: #2d3748;
    font-weight: 600;
  }
  em {
    color: #4a5568;
    font-style: italic;
  }
`;

const UserDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/blogs/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    }
  };

  const handleGenerateContent = async (type) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_BASE_URL}/ai/generate-content`,
        { topic, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (type === 'blog') {
        setContent(response.data.content);
      } else {
        setContent(response.data.content);
      }
      toast.success(`${type === 'blog' ? 'Blog content' : 'Blog ideas'} generated successfully!`);
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSEO = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_BASE_URL}/ai/optimize-seo`,
        { content, keywords: [topic] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent(response.data.optimizedContent);
      toast.success('Content SEO optimized!');
    } catch (error) {
      toast.error('Failed to optimize content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to create a blog');
        return;
      }

      setLoading(true);

      if (editingBlog) {
        // Update existing blog
        await axios.put(
          `${config.API_BASE_URL}/blogs/${editingBlog._id}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Blog updated successfully!');
        setEditingBlog(null);
      } else {
        // Create new blog
        await axios.post(
          `${config.API_BASE_URL}/blogs`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Blog created successfully!');
      }

      // Clear form and refresh blogs
      setTitle('');
      setContent('');
      setTopic('');
      await fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setTab(0); // Switch to edit tab
  };

  const handleDownloadPDF = async () => {
    if (!content) {
      toast.error('No content to download');
      return;
    }

    try {
      setLoading(true);
      const element = contentRef.current;
      
      const options = {
        margin: 10,
        filename: `${title || 'blog'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(element).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading PDF');
      console.error('PDF download error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_BASE_URL}/blogs/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  return (
    <StyledContainer>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.username}!
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Create New Blog" />
          <Tab label="My Blogs" />
        </Tabs>
      </Box>

      <AnimatePresence mode="wait">
        {tab === 0 ? (
          <StyledPaper
            key="create"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Blog Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topic for AI Generation"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <StyledButton
                    onClick={() => handleGenerateContent('blog')}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Generate Blog Content
                  </StyledButton>
                  <StyledButton
                    onClick={() => handleGenerateContent('idea')}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Generate Blog Ideas
                  </StyledButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ width: '100%', position: 'relative' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      minHeight: '300px',
                      maxHeight: '600px',
                      overflowY: 'auto',
                      backgroundColor: '#fff'
                    }}
                  >
                    <BlogPreviewContainer ref={contentRef}>
                      {content ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(content)
                          }}
                        />
                      ) : (
                        <Typography color="textSecondary" sx={{ p: 2 }}>
                          Generated content will appear here
                        </Typography>
                      )}
                    </BlogPreviewContainer>
                    <Box sx={{ display: 'flex', gap: 1, position: 'absolute', top: 8, right: 8 }}>
                      {content && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setContent('')}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDownloadPDF}
                            disabled={loading}
                            startIcon={<DownloadIcon />}
                          >
                            Download
                          </Button>
                        </>
                      )}
                    </Box>
                  </Paper>
                  {/* <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setContent('')}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: content ? 'block' : 'none'
                    }}
                  >
                    Clear
                  </Button> */}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <StyledButton
                    onClick={handleOptimizeSEO}
                    disabled={loading || !content}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Optimize for SEO
                  </StyledButton>
                  <StyledButton
                    onClick={handleCreateBlog}
                    disabled={!title || !content}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingBlog ? 'Update Blog' : 'Save Blog'}
                  </StyledButton>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        ) : (
          <motion.div
            key="blogs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardContent>
                  <Typography variant="h6">{blog.title}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(blog.content)
                    }}
                    style={{
                      maxHeight: '200px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50px',
                      background: 'linear-gradient(transparent, white)'
                    }}
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditBlog(blog)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteBlog(blog._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </BlogCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
};

export default UserDashboard;
