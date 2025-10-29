// src/hooks/useCollectibles.ts
import { useEffect, useState } from "react";
import { collectiblesService } from "@/services/collectibles";
import { mapBackendToFrontend } from "@/lib/mapper/collectibleMapper";
import type { FrontendCollectible, BackendCollectible } from "@/types/collectible";

export function useCollectibles(eventId?: string) {
    const [collectibles, setCollectibles] = useState<FrontendCollectible[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadCollectibles() {
        if (!eventId) return;
        setLoading(true);
        try {
            const data = (await collectiblesService.getActive(eventId)) as BackendCollectible[];
            const mapped = data.map(mapBackendToFrontend);
            setCollectibles(mapped);
        } catch (err) {
            console.error("Error loading collectibles:", err);
            setCollectibles([]);
        } finally {
            setLoading(false);
        }
    }

    // 🧩 Nueva función para generar uno antes de recargar
    async function generateCollectible() {
        if (!eventId) return;
        try {
            await collectiblesService.generate(eventId);
            await loadCollectibles();
        } catch (err) {
            console.error("Error generating collectible:", err);
        }
    }

    useEffect(() => {
        if (!eventId) return;

        // carga inicial
        loadCollectibles();

        // intervalo para generar y refrescar (1 minuto)
        const interval = setInterval(() => {
            generateCollectible();
        }, 60000);

        return () => clearInterval(interval);
    }, [eventId]);

    return { collectibles, loading, reload: loadCollectibles };
}
