import { api } from "./api";

export const adminService = {
  async getAllAdvertisements() {
    const { data } = await api.get("/advertisements/admin");
    return data.data;
  },

  async setVisibility(id, isVisible) {
    const { data } = await api.put(
      `/advertisements/${id}/visibility`,
      isVisible,
      { headers: { "Content-Type": "application/json" } }
    );
    return data.data;
  },

  async deleteAdvertisement(id) {
    await api.delete(`/advertisements/${id}`);
  },
};
