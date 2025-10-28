import { useEffect, useState } from "react";
import { collectiblesService } from "../services/collectibles";

export interface Collectible {
    _id: string;
    name: string;
    type: "common" | "rare" | "epic" | "legendary";
    rarity_score: number;
    image_url: string;
    description: string;
    event_id: string;
    drop_location: { type: "Point"; coordinates: [number, number] };
    expires_at: string;
    is_active: boolean;
}

export function useCollectibles(eventId?: string) {
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadCollectibles() {
        if (!eventId) return;
        setLoading(true);
        try {
            const data = await collectiblesService.getActive(eventId);
            setCollectibles(data);
        } catch (err) {
            console.error("Error loading collectibles:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCollectibles();
        const interval = setInterval(loadCollectibles, 10000);
        return () => clearInterval(interval);
    }, [eventId]);

    return { collectibles, loading, reload: loadCollectibles };
}
