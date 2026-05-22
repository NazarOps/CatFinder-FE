import { api } from "./api";

// commentService - hämta och skapa kommentarer på annonser
export const commentService = {
  async getByAdvertisement(advertisementId) {
    const { data } = await api.get(`/advertisements/${advertisementId}/comments`);
    return data.data ?? [];
  },

  async create(advertisementId, payload) {
    const body = { ...payload, advertisementId: Number(advertisementId) };
    const { data } = await api.post(
      `/advertisements/${advertisementId}/comments`,
      body
    );
    return data.data;
  },

  async delete(commentId) {
    await api.delete(`/comments/${commentId}`);
  },
};
