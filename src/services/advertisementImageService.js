import { api } from "./api";

export const advertisementImageService = {
  async upload(advertisementId, file, isPrimary = false) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("advertisementId", advertisementId);
    formData.append("isPrimary", isPrimary);
    const { data } = await api.post("/advertisementimages/upload", formData);
    return data.data;
  },

  async getByAdvertisement(advertisementId) {
    const { data } = await api.get(`/advertisementimages/advertisement/${advertisementId}`);
    return data.data;
  },
};
