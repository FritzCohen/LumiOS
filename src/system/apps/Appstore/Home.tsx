import { Game } from "../../../utils/types";
import GameList from "./GameList";
//import RainbowButtonGrid from "./RainbowGrid";

interface HomeProps {
    games: Game[]
    sort: string
    setSort: (prev: string) => void
    setSelectedGame: (prev: Game | null) => void;
}

const Home: React.FC<HomeProps> = ({ games, sort, setSelectedGame }) => {
    return ( 
        <div className="overflow-y-auto overflow-x-hidden px-2">
            
            <GameList games={games} title="All games" sort={sort} setFlexProp={() => {}} setSelectedGame={setSelectedGame} />
        </div>
    );
}
 
export default Home;