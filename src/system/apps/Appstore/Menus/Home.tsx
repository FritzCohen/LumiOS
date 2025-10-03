//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonGrid from "../../../gui/components/Appstore/ButtonGrid";
import GameList from "../../../gui/components/Appstore/GameList";
//import Button from "../../../lib/Button";
import { Game, useAppstoreProps } from "../appstoreTypes";
import Carousel from "../Carousel";
//import { faPaintBrush, faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";
import RandomGame from "../../../gui/components/Appstore/RandomGame";

function randomizeArray(length: number, games: Game[]): Game[] {
  if (length <= 0) return [];
  if (!games || games.length === 0) return [];

  // Copy the array so we don’t mutate the original
  const shuffled = [...games];

  // Fisher–Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Slice to requested length
  return shuffled.slice(0, Math.min(length, shuffled.length));
}

const Home: React.FC<{ store: useAppstoreProps }> = ({ store }) => {
	return (
		<div className="w-full h-full overflow-y-auto overflow-hidden relative pb-20">
			<Carousel games={store.games.slice(0, 5)} setSelectedGame={store.selectGame} />
            {/* Themes and stuffs */}
            {/*<div className="w-full flex justify-center items-center my-4 gap-2">
                <Button onClick={() => store.setMenu(6)}>Extensions <FontAwesomeIcon icon={faPuzzlePiece} /></Button>
                <Button onClick={() => store.setMenu(7)}>Themes <FontAwesomeIcon icon={faPaintBrush} /></Button>
            </div>*/}
			<GameList
				title="Popular"
				sort="popular"
				flex
				games={store.games}
				setSelectedGame={store.selectGame}
				setGenre={store.selectGenre}
			/>
			<RandomGame games={store.games} setSelectedGame={store.selectGame} />
            <GameList
				title="Shooter"
				sort="shooter"
				flex
				games={store.games}
				setSelectedGame={store.selectGame}
				setGenre={store.selectGenre}
			/>
            <h3 className="text-2xl text-center font-bold">Catagories</h3>
            <ButtonGrid store={store} />
            <GameList
				title="Platformer Games"
				sort="platformer"
				flex
				games={store.games}
				setSelectedGame={store.selectGame}
				setGenre={store.selectGenre}
			/>
			<Carousel games={randomizeArray(10, store.games)} setSelectedGame={store.selectGame} />
		</div>
	);
};

export default Home;
