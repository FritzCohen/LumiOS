import { useEffect, useState } from "react";
import { Game } from "../../../utils/types";
import GameList from "./GameList";
import virtualFS from "../../../utils/VirtualFS";
import { useUser } from "../../../Providers/UserProvider";

interface LibraryProps {
    games: Game[];
    setSelectedGame: (prev: Game | null) => void;
}

const Recents: React.FC<LibraryProps> = ({ setSelectedGame }) => {
    const [recents, setRecents] = useState<Game[]>([]);
    const { currentUser } = useUser();

    useEffect(() => {
        const getRecents = async () => {
            if (!currentUser) return;

            const allRecents = await virtualFS.readdir(`Users/${currentUser.username}/AppStore/Recents/`);
            
            const fetchedRecents: (Game | null)[] = await Promise.all(
                Object.keys(allRecents).map(async (item) => {
                    const file = allRecents[item];
                    if (file.type === "directory") return null; // Skip directories
                    
                    // If jason
                    try {
                        const parsed = JSON.parse(await file.content) as Game;
                        return parsed
                    } catch {
                        // Not jayson then
                        return await file.content as Game;
                    }
                })
            );

            // Filter out any null values from directories
            setRecents(fetchedRecents.filter((game): game is Game => game !== null));
        };

        getRecents();
    }, []);

    return (
        <div className="px-2">
            <GameList games={recents} title="Recents" sort="" setSelectedGame={setSelectedGame} />
        </div>
    );
};

export default Recents;