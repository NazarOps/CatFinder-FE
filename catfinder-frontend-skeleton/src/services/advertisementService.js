import { api } from "./api";
export const advertisementService = {
  async getAll() { const { data } = await api.get("/advertisements"); return data; },
  async getById(id) { const { data } = await api.get(`/advertisements/${id}`); return data; },
  async create(payload) { const { data } = await api.post("/advertisements", payload); return data; },
  async save(id) { const { data } = await api.post(`/advertisements/${id}/save`); return data; },
  async unsave(id) { await api.delete(`/advertisements/${id}/save`); },
};
