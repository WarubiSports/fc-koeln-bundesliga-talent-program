import { Router } from 'express';
import { storage } from './storage';
import { insertJoinRequestSchema, insertUserSchema } from '../shared/schema';
import { z } from 'zod';

const router = Router();

// Join request routes
router.post('/api/join-requests', async (req, res) => {
  try {
    const validatedData = insertJoinRequestSchema.parse(req.body);
    const joinRequest = await storage.createJoinRequest(validatedData);
    res.json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Error creating join request:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof z.ZodError ? error.errors : 'Failed to create join request' 
    });
  }
});

router.get('/api/join-requests', async (req, res) => {
  try {
    const joinRequests = await storage.getJoinRequests();
    res.json({ success: true, data: joinRequests });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch join requests' });
  }
});

router.get('/api/join-requests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const joinRequest = await storage.getJoinRequest(id);
    
    if (!joinRequest) {
      return res.status(404).json({ success: false, error: 'Join request not found' });
    }
    
    res.json({ success: true, data: joinRequest });
  } catch (error) {
    console.error('Error fetching join request:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch join request' });
  }
});

router.patch('/api/join-requests/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, adminNotes, reviewedBy } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const updatedRequest = await storage.updateJoinRequestStatus(id, status, adminNotes, reviewedBy);
    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Error updating join request status:', error);
    res.status(500).json({ success: false, error: 'Failed to update join request status' });
  }
});

router.delete('/api/join-requests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteJoinRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting join request:', error);
    res.status(500).json({ success: false, error: 'Failed to delete join request' });
  }
});

// User management routes
router.get('/api/users', async (req, res) => {
  try {
    // This would need to be implemented in storage if needed
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.get('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

router.patch('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = insertUserSchema.partial().parse(req.body);
    
    const updatedUser = await storage.updateUser(id, updateData);
    
    // Don't return password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof z.ZodError ? error.errors : 'Failed to update user' 
    });
  }
});

router.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

export default router;