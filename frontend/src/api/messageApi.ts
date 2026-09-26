import { httpClient } from './httpClient'
import { Conversation, Message, PaginatedMessages, ConversationParticipant } from '../types'

// The backend endpoints in SecureMessagingController:
// POST   /capability/api/v1/conversations
// GET    /capability/api/v1/conversations
// GET    /capability/api/v1/conversations/{id}
// POST   /capability/api/v1/conversations/{id}/participants
// DELETE /capability/api/v1/conversations/{id}/participants/{userId}
// GET    /capability/api/v1/conversations/{id}/messages?page={page}&size={size}
// POST   /capability/api/v1/conversations/{id}/messages
// PATCH  /capability/api/v1/messages/{id}/read?conversationId={id}
// DELETE /capability/api/v1/messages/{id}

export const messageApi = {
  createConversation: async (type: string, contextId?: string): Promise<Conversation> => {
    const response = await httpClient.post('/capability/api/v1/conversations', { 
      conversationType: type, 
      referenceId: contextId 
    })
    return normalizeConversation(response.data)
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await httpClient.get('/capability/api/v1/conversations')
    return response.data.map(normalizeConversation)
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await httpClient.get(`/capability/api/v1/conversations/${id}`)
    return normalizeConversation(response.data)
  },

  addParticipant: async (conversationId: string, userId: string): Promise<ConversationParticipant> => {
    const response = await httpClient.post(`/capability/api/v1/conversations/${conversationId}/participants`, { userId })
    return response.data
  },

  removeParticipant: async (conversationId: string, userId: string): Promise<void> => {
    await httpClient.delete(`/capability/api/v1/conversations/${conversationId}/participants/${userId}`)
  },

  getMessages: async (conversationId: string, page = 0, size = 20): Promise<PaginatedMessages> => {
    const response = await httpClient.get(`/capability/api/v1/conversations/${conversationId}/messages`, {
      params: { page, size }
    })
    const data = response.data
    return {
      ...data,
      content: data.content.map(normalizeMessage)
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await httpClient.post(`/capability/api/v1/conversations/${conversationId}/messages`, { content })
    return normalizeMessage(response.data)
  },

  markAsRead: async (conversationId: string, messageId: string): Promise<void> => {
    await httpClient.patch(`/capability/api/v1/messages/${messageId}/read`, null, {
      params: { conversationId }
    })
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await httpClient.delete(`/capability/api/v1/messages/${messageId}`)
  }
}

function normalizeConversation(c: any): Conversation {
  return { 
    ...c, 
    id: c.conversationId || c.id,
    type: c.conversationType || c.type,
    contextId: c.referenceId || c.contextId
  }
}

function normalizeMessage(m: any): Message {
  return { 
    ...m, 
    id: m.messageId || m.id,
    sentAt: m.createdAt || m.sentAt 
  }
}
