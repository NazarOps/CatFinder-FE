import { api } from "./api";

export const posterService = {
  async analyze(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    const { data } = await api.post("/posteranalysis", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
