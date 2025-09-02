import { apiClient } from "./axiosConfig";

export async function profilepic(photo) {
    try {
        const response = await apiClient.post(`/api/user/profilepic`, { photo });
        return response.data;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
    }
}

export async function deleteProfile() {
    try {
        const response = await apiClient.delete(`/api/user/profile`);
        return response.data;
    } catch (error) {
        console.error("Error deleting profile:", error);
        throw error;
    }
}