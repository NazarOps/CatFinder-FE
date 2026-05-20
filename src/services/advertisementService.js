import { api } from "./api";

// advertisementService - hämta, skapa och hantera annonser
export const advertisementService = {
  async getAll() {
    const { data } = await api.get("/advertisements");
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/advertisements/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post("/advertisements", payload);
    return data.data;
  },

  async save(id) {
    const { data } = await api.post(`/advertisements/${id}/save`);
    return data.data;
  },

  async unsave(id) {
    await api.delete(`/advertisements/${id}/save`);
  },

  async getSaved() {
    const { data } = await api.get("/advertisements/saved");
    return data.data ?? [];
  },

  async delete(id) {
    await api.delete(`/advertisements/${id}`);
  },
};
