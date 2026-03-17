import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Notification,
  PaginationParams,
} from "@/types";

class NotificationService {
  /**
   * Get all notifications for the authenticated user
   */
  async getNotifications(params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Notification[]>>(
      `/notifications?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await Fetch.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return response.data;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<ApiResponse<null>> {
    const response = await Fetch.put<ApiResponse<null>>(
      `/notifications/${id}/read`,
      {}
    );
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await Fetch.put<ApiResponse<null>>(
      "/notifications/read-all",
      {}
    );
    return response.data;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(`/notifications/${id}`);
    return response.data;
  }
}

export default new NotificationService();
