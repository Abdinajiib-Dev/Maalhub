import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // First get the conversation IDs the user is part of
    const { data: participants, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (participantError) throw participantError;

    if (!participants || participants.length === 0) {
      return res.json([]);
    }

    const conversationIds = participants.map(p => p.conversation_id);

    // Now fetch the conversations with their participants (to know who we're talking to)
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        updated_at,
        participants:conversation_participants(
          user:profiles(id, full_name, role, profile_photo_url)
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a new conversation or get existing one
router.post('/', requireAuth, async (req, res) => {
  try {
    const { participant_id } = req.body;
    const userId = req.user.id;

    if (!participant_id || participant_id === userId) {
      return res.status(400).json({ error: 'Invalid participant_id' });
    }

    // Checking if a conversation already exists between these two users is complex in Supabase REST API
    // We'd ideally have an RPC function. For simplicity here, we create a new one or you can add logic to find existing.

    // 1. Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{}]) // default values
      .select()
      .single();

    if (convError) throw convError;

    // 2. Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: userId },
        { conversation_id: conversation.id, user_id: participant_id }
      ]);

    if (partError) throw partError;

    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread messages
router.get('/unread', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all conversation IDs the user is part of
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError) throw partError;
    if (!participants || participants.length === 0) return res.json({ count: 0, messages: [] });

    const conversationIds = participants.map(p => p.conversation_id);

    // 2. Fetch unread messages where user is NOT the sender
    const { data: unreadMessages, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, profile_photo_url)
      `)
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    res.json({
      count: unreadMessages.length,
      messages: unreadMessages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Check if user is part of the conversation
    const { data: participant, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (partError || !participant) {
      return res.status(403).json({ error: 'Not a participant of this conversation' });
    }

    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Check if user is part of the conversation
    const { data: participant, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (partError || !participant) {
      return res.status(403).json({ error: 'Not a participant of this conversation' });
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: userId,
        message
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Update conversation updated_at trigger should handle this automatically in DB, but just in case:
    await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', conversationId);

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark conversation messages as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Update messages in this conversation where sender is NOT the current user
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
