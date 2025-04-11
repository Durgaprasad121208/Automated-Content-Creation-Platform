import express from 'express';
import Blog from '../models/Blog.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create blog post
router.post('/', verifyToken, async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author: req.user.id,
    });
    const savedBlog = await (await blog.save()).populate('author', 'username email');
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    // Handle deleted users
    const processedBlogs = blogs.map(blog => {
      if (!blog.author) {
        return {
          ...blog.toObject(),
          author: { username: 'Deleted User', email: '' }
        };
      }
      return blog;
    });

    res.json(processedBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's blog posts
router.get('/user', verifyToken, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update blog post
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'username email');

    if (!updatedBlog.author) {
      updatedBlog.author = { username: 'Deleted User', email: '' };
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete blog post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
