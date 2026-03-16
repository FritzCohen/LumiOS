import React from "react";
import { useAppstoreProps } from "../appstoreTypes";
import GameList from "../../../gui/components/Appstore/GameList";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Genre: React.FC<{ store: useAppstoreProps }> = ({ store }) => {
	if (!store.selectedGenre) return null;

	return (
		<div>
			<Button onClick={() => store.goHome()}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
			<GameList
				games={store.games}
				title={`
					${store.selectedGenre.slice(0,1).toUpperCase()}${store.selectedGenre.slice(1)}
					Games
				`}
				sort={store.selectedGenre}
				setSelectedGame={store.selectGame}
				setGenre={store.selectGenre}

			/>
		</div>
	);
};

export default Genre;
