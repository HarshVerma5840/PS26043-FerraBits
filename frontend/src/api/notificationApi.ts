import { httpClient, pageParams } from './httpClient'

export interface NotificationResponse {
  eventId: string
  problemId: string
  eventType: string
  title: string
  body: string
  previousStatus: string | null
  newStatus: string | null
  read: boolean
  createdAt: string
}

export const notificationApi = {
  getNotifications: async (params?: {
    page?: number
    size?: number
  }): Promise<{ content: NotificationResponse[]; totalElements: number; totalPages: number }> => {
    const response = await httpClient.get('/notifications', {
      params: pageParams({ page: params?.page, size: params?.size }),
    })
    return response.data
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await httpClient.get('/notifications/unread-count')
    return response.data.unreadCount
  },

  markAsRead: async (id: string): Promise<void> => {
    await httpClient.patch(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await httpClient.patch('/notifications/read-all')
  },
}
