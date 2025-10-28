// src/services/collectibles.ts
import api from "./api";

export const collectiblesService = {
    async getActive(eventId: string) {
        const res = await api.get(`/api/collectibles/active/${eventId}`);
        return res.data;
    },

    async claim(collectibleId: string, userId: string) {
        const res = await api.post(`/api/collectibles/claim`, null, {
            params: { collectible_id: collectibleId, user_id: userId },
        });
        return res.data;
    },
};
