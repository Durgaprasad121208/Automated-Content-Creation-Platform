import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '1200px !important'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '15px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: '12px',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: '#1a237e',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '1rem',
    padding: theme.spacing(2),
    '&:first-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
    '&:last-child': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  '& .MuiTableCell-body': {
    padding: theme.spacing(2),
    fontSize: '0.95rem',
    '&:first-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
    '&:last-child': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
  },
  '&:hover': {
    backgroundColor: '#eeeeee',
    transition: 'background-color 0.2s ease',
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  minWidth: '120px',
  color: '#1a237e',
  '&.Mui-selected': {
    color: '#1a237e',
    fontWeight: 600,
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: '#1a237e',
    height: '3px',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#1a237e',
  color: '#ffffff',
  fontSize: '1.25rem',
  fontWeight: 600,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '& p': {
    marginBottom: theme.spacing(2),
  }
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: '#f5f5f5',
}));

const StyledActionButton = styled(Button)(({ theme, color }) => ({
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  borderRadius: '25px',
  backgroundColor: color === 'error' ? '#ef5350' : '#1a237e',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: color === 'error' ? '#e53935' : '#0d47a1',
  }
}));

const BlogPreviewContainer = styled('div')`
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

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersResponse, blogsResponse] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${config.API_BASE_URL}/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(usersResponse.data);
      setBlogs(blogsResponse.data);
    } catch (error) {
      toast.error('Error fetching data');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_BASE_URL}/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_BASE_URL}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Blog deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setDialogOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedBlog) {
      toast.error('No blog selected');
      return;
    }

    try {
      setLoading(true);
      const element = contentRef.current;
      
      const options = {
        margin: 10,
        filename: `${selectedBlog.title || 'blog'}.pdf`,
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

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          color: '#1a237e',
          fontWeight: 600,
          marginBottom: 3
        }}>
          Admin Dashboard
        </Typography>

        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <StyledTab label="Users" />
          <StyledTab label="Blogs" />
        </StyledTabs>

        {activeTab === 0 && (
          <StyledTableContainer>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {users.map((user) => (
                  <StyledTableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      {user.role !== 'admin' && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

        {activeTab === 1 && (
          <StyledTableContainer>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {blogs.map((blog) => (
                  <StyledTableRow key={blog._id}>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>
                      {blog.author?.username || 'Unknown Author'}
                    </TableCell>
                    <TableCell>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewBlog(blog)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteBlog(blog._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </StyledPaper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedBlog?.title}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDownloadPDF}
              disabled={loading}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <BlogPreviewContainer ref={contentRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: selectedBlog ? DOMPurify.sanitize(selectedBlog.content) : ''
              }}
            />
          </BlogPreviewContainer>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
            Author: {selectedBlog?.author?.username || 'Unknown Author'}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Created: {selectedBlog ? new Date(selectedBlog.createdAt).toLocaleString() : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
          {selectedBlog && (
            <Button
              color="error"
              onClick={() => handleDeleteBlog(selectedBlog._id)}
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
}

export default AdminDashboard;
