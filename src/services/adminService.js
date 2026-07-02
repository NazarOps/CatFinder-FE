import { api } from "./api";

export const adminService = {
  async getAllAdvertisements() {
    const { data } = await api.get("/advertisements/admin");
    return data.data;
  },

  async updateModerationStatus(id, moderationStatus) {
    const { data } = await api.put(
      `/advertisements/${id}/moderation-status`,
      moderationStatus,
      { headers: { "Content-Type": "application/json" } }
    );
    return data.data;
  },

  async updateAdvertisementStatus(id, status) {
    const { data } = await api.put(
      `/advertisements/${id}/status`,
      status,
      { headers: { "Content-Type": "application/json" } }
    );
    return data.data;
  },

  async deleteAdvertisement(id) {
    await api.delete(`/advertisements/${id}`);
  },
};
