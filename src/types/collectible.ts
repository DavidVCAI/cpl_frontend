// src/types/collectible.ts
export interface BackendCollectible {
    _id: string;
    name: string;
    type: "common" | "rare" | "epic" | "legendary";
    rarity_score?: number;
    image_url?: string | null;
    description?: string;
    event_id?: string;
    dropped_at?: string;
    expires_at?: string;
    is_active?: boolean;
    // ...otros campos del backend
}

export interface FrontendCollectible {
    id: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    image?: string;
    description?: string;
}
