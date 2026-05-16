import { api } from "./api";

// commentService - hämta och skapa kommentarer på annonser
export const commentService = {
  async getByAdvertisement(advertisementId) {
    const { data } = await api.get(`/advertisements/${advertisementId}/comments`);
    return data;
  },

  async create(advertisementId, payload) {
    const { data } = await api.post(
      `/advertisements/${advertisementId}/comments`,
      payload
    );
    return data;
  },
};
