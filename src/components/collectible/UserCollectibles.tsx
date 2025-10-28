import { useEffect, useState } from "react";
import { collectibleImages } from "@/constants/collectibleImages";
import { Trophy } from "lucide-react";

interface Collectible {
    _id: string;
    name: string;
    rarity: keyof typeof collectibleImages;
    description?: string;
}

interface Props {
    userId: string;
}

export default function UserCollectibles({ userId }: Props) {
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectibles = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/collectibles/user/${userId}`);
                if (!res.ok) throw new Error("Error al cargar coleccionables");
                const data = await res.json();
                setCollectibles(data.collectibles || []);
            } catch (err) {
                console.error(err);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {collectibles.map((item) => (
                <div
                    key={item._id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
                >
                    <div className="relative w-full aspect-square flex items-center justify-center">
                        <img
                            src={collectibleImages[item.rarity] || collectibleImages["common"]}
                            alt={item.name}
                            className="w-24 h-24 object-contain mx-auto"
                        />
                        <span
                            className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                                item.rarity === "legendary"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : item.rarity === "epic"
                                        ? "bg-purple-500/20 text-purple-300"
                                        : item.rarity === "rare"
                                            ? "bg-blue-500/20 text-blue-300"
                                            : "bg-gray-600/20 text-gray-400"
                            }`}
                        >
              {item.rarity.toUpperCase()}
            </span>
                    </div>

                    <div className="mt-4 text-center">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        {item.description && (
                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
