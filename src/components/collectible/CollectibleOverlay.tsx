import React, { useState } from "react";
import { collectibleImages } from "@/constants/collectibleImages";
import { collectiblesService } from "@/services/collectibles";
import { useAuthStore } from "@/store/authStore";
import type { FrontendCollectible } from "@/types/collectible";

interface CollectibleOverlayProps {
    collectible: FrontendCollectible | null;
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
    const [claiming, setClaiming] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    if (!visible || !collectible) return null;

    const rarityColors: Record<FrontendCollectible["rarity"], string> = {
        common: "from-gray-600 to-gray-800",
        rare: "from-blue-500 to-indigo-700",
        epic: "from-purple-500 to-fuchsia-700",
        legendary: "from-yellow-400 to-amber-600",
    };

    const imageSrc =
        collectible.image ||
        collectibleImages[collectible.rarity] ||
        collectibleImages.common;

    async function handleClaim() {
        if (!collectible) return;

        try {
            if (!isAuthenticated || !user) {
                alert("⚠️ Debes iniciar sesión para reclamar un coleccionable.");
                return;
            }

            setClaiming(true);

            const res = await collectiblesService.claim(
                collectible.id,
                user.id
            );

            if (res.success) {
                alert("🎉 ¡Has reclamado un coleccionable!");
                onClaim(collectible.id);
                onClose?.();
            } else {
                alert(`⚠️ ${res.message}`);
            }
        } catch {
            alert("Error al reclamar el coleccionable.");
        } finally {
            setClaiming(false);
        }
    }

    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-[9999] backdrop-blur-sm">
            <div
                className={`p-8 rounded-xl bg-gradient-to-b ${
                    rarityColors[collectible.rarity]
                } shadow-lg text-center animate-fade-in`}
            >
                <img
                    src={imageSrc}
                    alt={collectible.name}
                    className="w-32 h-32 mb-4 mx-auto drop-shadow-lg"
                    onError={() => console.warn("⚠️ Imagen no encontrada:", imageSrc)}
                />
                <h2 className="text-2xl font-bold mb-2">{collectible.name}</h2>
                <p className="text-gray-200 mb-6 text-sm">{collectible.description}</p>

                <div className="flex space-x-4 justify-center">
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${
                            claiming
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {claiming ? "Reclamando..." : "¡Reclamar!"}
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
