import React from "react";
import {collectibleImages} from "@/constants/collectibleImages.ts";

interface Collectible {
    id: string;
    name: string;
    image: string;
    description: string;
    rarity: "common" | "rare" | "epic" | "legendary";
}

interface CollectibleOverlayProps {
    collectible: Collectible | null;
    visible: boolean;
    onClaim: (id: string) => void;
    onClose?: () => void;
}

export const CollectibleOverlay: React.FC<CollectibleOverlayProps> = ({
                                                                          collectible,
                                                                          visible,
                                                                          onClaim,
                                                                          onClose,
                                                                      }) => {
    if (!visible || !collectible) return null;

    const rarityColors: Record<Collectible["rarity"], string> = {
        common: "from-gray-600 to-gray-800",
        rare: "from-blue-500 to-indigo-700",
        epic: "from-purple-500 to-fuchsia-700",
        legendary: "from-yellow-400 to-amber-600",
    };
    const imageSrc =
        collectible.image || collectibleImages[collectible.rarity] || collectibleImages.common;

    return (
        <div
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50 backdrop-blur-sm">
            <div
                className={`p-8 rounded-xl bg-gradient-to-b ${rarityColors[collectible.rarity]} shadow-lg text-center animate-fade-in`}
            >
                <img
                    src={imageSrc}
                    alt={collectible.name}
                    className="w-32 h-32 mb-4 mx-auto drop-shadow-lg"
                />
                <h2 className="text-2xl font-bold mb-2">{collectible.name}</h2>
                <p className="text-gray-200 mb-6 text-sm">{collectible.description}</p>

                <div className="flex space-x-4 justify-center">
                    <button
                        onClick={() => onClaim(collectible.id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                    >
                        ¡Reclamar!
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
