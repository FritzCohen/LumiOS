import { useState } from "react";
import { Game } from "../../../utils/types";
import Input from "../../lib/Input";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";

interface GameListProps {
    title: string;
    sort: string;
    bar?: boolean;
    games: Game[];
    setFlexProp?: (prev: boolean) => void;
    setSelectedGame: (prev: Game) => void;
}

const GameList: React.FC<GameListProps> = ({ title, sort: s, bar, games, setSelectedGame }) => {
    const [flex, setFlex] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [sort, setSort] = useState(s);

    return (
        <div
            style={{
                background: bar
                ? 'linear-gradient(to bottom, rgba(128, 0, 128, 0.8), rgba(128, 0, 128, 0))'
                : 'none', // Or any other background if `bar` is false
                height: '100%', // Ensure it fills the container height
                width: '100%',  // Ensure it fills the container width
                padding: bar ? '8px' : ''
            }}
            className={`${flex ? "" : "!overflow-x-hidden"}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex w-1/2">
                {sort !== "" && <Button className="mr-4 w-24" onClick={() => setSort("")}><FontAwesomeIcon icon={faCaretLeft} /> Back</Button>}
                <h3 className="font-bold text-xl my-2 flex-grow w-full">{ sort ? sort : title }</h3>
                </div>
                <Input placeholder="Search games..." className="" onChange={(e) => setInput(e.target.value)} />
            </div>
            <div
                className={`mx-2 ${flex ? 'flex-game' : 'container-game'} !overflow-hidden px-2`}
                style={{ width: '100%', overflowX: 'auto', position: 'relative' }}
                id="gamecontainer"
            >
            {games.length == 0 && (
                <h3>No games to display.</h3>
            )}
            {games && games
                .filter((game: Game) => ((sort === "" || game?.types?.includes(sort)) || sort === "All Games") && game.name.toLowerCase().includes(input.toLowerCase()))
                .map((game: Game, index: number) => {            
                
                const isFlash = game?.type?.includes("html");
                        
                return (
                    <div
                        className={`card bg-black img__wrap flex justify-center cursor-pointer ${flex && 'flex-shrink-0'}`}
                        onClick={() => setSelectedGame(game)}
                        key={index}
                    >
                        <img src={game.image || game.svg } className="img__img object-cover image" alt="" loading="lazy" />
                        <div className={`${!isFlash ? "absolute opacity-100 inset-0 transition-opacity p-2 backdrop-blur backdrop-brightness-75" : "img__description_layer "}`}>
                        <h2 className="text-xl font-bold">{game.name}</h2>
                        <p className="text-base flex-grow">{game.description ? `${game.description.substring(0, 100)}...` : "Click to play!"}</p>
                        <div className="absolute grid grid-cols-3 gap-2 h-[30px] bottom-0 bg-transparent text-[8px] font-bold">
                            <span className="bg-gray-800 p-1 rounded-lg flex items-center justify-center"></span>
                            <span className="bg-gray-800 p-1 rounded-lg flex items-center justify-center"></span>
                            <span className="bg-gray-800 p-1 rounded-lg flex items-center justify-center"></span>
                        </div>
                        </div>
                    </div>
                )
            })}
            </div>
        </div>
     );
}
 
export default GameList;