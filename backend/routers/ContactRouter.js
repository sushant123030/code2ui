const express = require('express');
const router = express.Router();
const Contact = require('../models/ContactModel');
const authenticateToken = require('../middleware/authenticateToken');

// POST - Submit a contact message
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, subject, message) are required'
      });
    }

    // Create new contact message
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    return res.status(201).json({
      success: true,
      message: 'Contact message received. We will get back to you soon!',
      data: newContact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact message'
    });
  }
});

// GET - Retrieve all contact messages (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // You can add admin check here if needed
    const messages = await Contact.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages'
    });
  }
});

// PATCH - Mark a message as read
router.patch('/mark-read/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: updated
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

// DELETE - Delete a contact message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;
