import GameList from "../../../gui/components/Appstore/GameList";
import { Game, useAppstoreProps } from "../appstoreTypes";

const Library: React.FC<{ store: useAppstoreProps, installed: Game[] }> = ({ store, installed }) => {

	return (
		<GameList
			games={installed}
			title="Library"
			sort=""
			setGenre={store.selectGenre}
			setSelectedGame={store.selectGame}
		/>
	);
};

export default Library;
