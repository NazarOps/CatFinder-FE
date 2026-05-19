import { api } from "./api";

export const advertisementImageService = {
  async upload(advertisementId, file) {
    const formData = new FormData();
    formData.append("advertisementId", advertisementId);
    formData.append("file", file);

    const { data } = await api.post("/advertisementimages", formData);
    return data.data;
  },

  async getByAdvertisement(advertisementId) {
    const { data } = await api.get(`/advertisementimages/advertisement/${advertisementId}`);
    return data;
  },
};
