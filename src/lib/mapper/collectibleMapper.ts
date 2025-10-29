// src/lib/mappers/collectibleMapper.ts
import type { BackendCollectible, FrontendCollectible } from "@/types/collectible";
import { collectibleImages } from "@/constants/collectibleImages";

export function mapBackendToFrontend(b: BackendCollectible): FrontendCollectible {
    const rarity = b.type || "common";
    const image = b.image_url || collectibleImages[rarity] || collectibleImages.common;

    return {
        id: b._id,
        name: b.name,
        rarity,
        image,
        description: b.description || "",
    };
}
