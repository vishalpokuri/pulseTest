const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export interface User {
  _id: string;
  username: string;
  role: "admin" | "editor" | "viewer";
}

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    const data = await response.json();
    return data.users;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch current user");
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    userId: string,
    role: "admin" | "editor" | "viewer"
  ): Promise<void> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user role");
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }
  }
}

export default new UserService();
