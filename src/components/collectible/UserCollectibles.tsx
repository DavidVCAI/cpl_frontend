import { useEffect, useState } from "react";
import { collectibleImages } from "@/constants/collectibleImages";
import { Trophy } from "lucide-react";
import { usersService } from "@/services/users";

interface CollectibleData {
    _id: string;
    name: string;
    type: keyof typeof collectibleImages;
    description?: string;
    rarity_score?: number;
}

interface UserCollectibleItem {
    user_id: string;
    collectible_id: string;
    claimed_at: string;
    claim_order: number;
    event_id: string;
    collectible: CollectibleData;
}

interface Props {
    userId: string;
}

export default function UserCollectibles({ userId }: Props) {
    const [collectibles, setCollectibles] = useState<UserCollectibleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectibles = async () => {
            try {
                const data = await usersService.getUserCollectibles(userId);
                console.log("📦 Collectibles data received:", data);
                setCollectibles(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error al obtener los coleccionables del usuario:", err);
                setCollectibles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectibles();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[400px] text-gray-400">
                Cargando coleccionables...
            </div>
        );
    }

    if (collectibles.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-[400px] text-gray-500">
                <Trophy className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-lg font-semibold">Aún no tienes coleccionables</p>
                <p className="text-sm text-gray-400 mt-1">Participa en eventos para conseguir algunos</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Tus Coleccionables</h2>
                <p className="text-gray-400">Has obtenido {collectibles.length} coleccionables</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collectibles.map((item) => {
                    const coll = item.collectible;
                    return (
                        <div
                            key={item.collectible_id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            <div className="relative w-full aspect-square flex items-center justify-center">
                                <img
                                    src={collectibleImages[coll.type] || collectibleImages["common"]}
                                    alt={coll.name}
                                    className="w-24 h-24 object-contain mx-auto"
                                />
                                <span
                                    className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                                        coll.type === "legendary"
                                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500"
                                            : coll.type === "epic"
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500"
                                                : coll.type === "rare"
                                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500"
                                                    : "bg-gray-600/20 text-gray-400 border border-gray-600"
                                    }`}
                                >
                                    {coll.type.toUpperCase()}
                                </span>
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-lg font-semibold text-white">{coll.name}</h3>
                                {coll.description && (
                                    <p className="text-sm text-gray-400 mt-1">{coll.description}</p>
                                )}
                                <div className="mt-2 text-xs text-gray-500">
                                    Obtenido: {new Date(item.claimed_at).toLocaleDateString('es-ES')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
