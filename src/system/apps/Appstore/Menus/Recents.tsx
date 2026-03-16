import { useEffect, useState } from "react";
import virtualFS from "../../../api/virtualFS";
import { Game } from "../appstoreTypes";
import GameList from "../../../gui/components/Appstore/GameList";
import { useUser } from "../../../../context/user/user";

interface RecentProps {
    games: Game[]
    setSelectedGame: (prev: Game) => void;
    setGenre: (prev: string) => void;
}

const Recents: React.FC<RecentProps> = ({ games, setSelectedGame, setGenre }) => {
    const [recents, setRecents] = useState<Game[]>([]);

    const { userDirectory } = useUser();

    useEffect(() => {
        const fetchRecents = async () => {
            // Ok so remove and differences to compare as safely as possible
            const recentGamesRaw = await virtualFS.readdir(`${userDirectory}/AppStore/Recents/`);
            const recentGames = Object.keys(recentGamesRaw).map(k =>
                k.replace(/\s/g, "").toLowerCase()
            );

            const sortedRecents = games.filter(value =>
                recentGames.includes(value.name.replace(/\s/g, "").toLowerCase())
            );

            setRecents(sortedRecents);
        };

        fetchRecents();
    }, [games, userDirectory]);

    return <GameList setSelectedGame={setSelectedGame} setGenre={setGenre} title="Recents" sort="" games={recents} />;
}
 
export default Recents;