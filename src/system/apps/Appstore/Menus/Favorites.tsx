import { useEffect, useState } from "react";
import virtualFS from "../../../api/virtualFS";
import { Game } from "../appstoreTypes";
import GameList from "../../../gui/components/Appstore/GameList";
import { useUser } from "../../../../context/user/user";

interface FavoriteProps {
    games: Game[];
    setSelectedGame: (prev: Game) => void;
    setGenre: (prev: string) => void;
}

const Favorites: React.FC<FavoriteProps> = ({ games, setSelectedGame, setGenre }) => {
    const [recents, setRecents] = useState<Game[]>([]);

    const { userDirectory } = useUser();

    useEffect(() => {
        const fetchFavorites = async () => {
            const recentGames = Object.keys(await virtualFS.readdir(`${userDirectory}/AppStore/Favorites/`));

            const sortedFavorites = games.filter(value => recentGames.includes(value.name));
            setRecents(sortedFavorites);
        };

        fetchFavorites();
    }, [games, userDirectory]);

    return <GameList setSelectedGame={setSelectedGame} setGenre={setGenre} title="Favorites" sort="" games={recents} />;
}
 
export default Favorites;