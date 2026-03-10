import request from '@/api/request.js'

export function getNotifications(unreadOnly = false) {
  return request({
    url: '/notifications',
    method: 'get',
    params: unreadOnly ? { unread: 'true' } : {},
  })
}

export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count',
    method: 'get',
  })
}

export function markNotificationRead(id) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'patch',
  })
}

export function markAllNotificationsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'patch',
  })
}
