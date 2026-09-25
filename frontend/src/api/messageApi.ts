import { httpClient } from './httpClient'
import { Conversation, Message } from '../types'

export const messageApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await httpClient.get('/capability/api/v1/conversations')
    return response.data
  },
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await httpClient.get(`/capability/api/v1/conversations/${conversationId}/messages`)
    return response.data
  },
  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await httpClient.post(`/capability/api/v1/conversations/${conversationId}/messages`, { content })
    return response.data
  }
}
