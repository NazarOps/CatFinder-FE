import { api } from "./api";

// advertisementService - hämta, skapa och hantera annonser
export const advertisementService = {
  async getAll({ skip = 0, take = 12, city = "", type } = {}) {
    const params = new URLSearchParams();
    if (skip) params.set("skip", skip);
    if (take !== 12) params.set("take", take);
    if (city) params.set("city", city);
    if (type != null) params.set("type", type);
    const { data } = await api.get(`/advertisements?${params}`);
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

  async save(advertisementId) {
    const { data } = await api.post("/SavedAdvertisements", {
      advertisementId: advertisementId,
    });

    return data.data;
  },

  async unsave(id) {
    await api.delete(`/SavedAdvertisements/${id}`);
  },

  async getSaved(accountId) {
    const { data } = await api.get(`/SavedAdvertisements/account/${accountId}`);

    return data
      .map((saved) => saved.advertisement)
      .filter(Boolean);
  },

  async delete(id) {
    await api.delete(`/advertisements/${id}`);
  },
};
