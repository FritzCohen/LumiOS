import { Game } from "../../../utils/types";
import GameList from "./GameList";

interface LibraryProps {
    games: Game[]
    setSelectedGame: (prev: Game | null) => void
}

const Library: React.FC<LibraryProps> = ({ games, setSelectedGame }) => {
    return ( 
        <div className="px-2">
            <GameList games={games} title="Installed Games" sort="" setSelectedGame={setSelectedGame} />
        </div>
    );
}
 
export default Library;