import { api } from "./api";

export const reportService = {
  async create(advertisementId, comment) {
    const { data } = await api.post(`/advertisements/${advertisementId}/reports`, { comment });
    return data.data;
  },

  async createCommentReport(advertisementId, commentId, comment) {
    const { data } = await api.post(
      `/advertisements/${advertisementId}/comments/${commentId}/reports`,
      { comment }
    );
    return data.data;
  },
};
