import { Game } from "../../../apps/Appstore/appstoreTypes";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import React, { useMemo } from "react";
import "./appstorestuff.css";

interface GameListProps {
	title: string;
	sort: string;
	games: Game[];
	bar?: boolean;
	flex?: boolean;
	setSelectedGame: (prev: Game) => void;
	setGenre: (genre: string) => void;
}

const GameList: React.FC<GameListProps> = ({
	title,
	sort,
	bar,
	games,
	flex,
	setSelectedGame,
	setGenre,
}) => {
	const filteredGames = useMemo(() => {
		return games?.filter(
			(game) =>
				sort === "" ||
				game?.types?.includes(sort) ||
				sort === "All Games"
		);
	}, [games, sort]);

	return (
		<div
			className={`game-list-wrapper ${bar ? "game-list-bar" : ""} ${
				flex ? "container" : ""
			}`}
		>
			<div className={`game-list-wrapper ${bar ? "game-list-bar" : ""}`}>
				{/* title stays above */}
				<h3 className="game-list-title">{title}</h3>

				{/* If there are no games :( */}
				{filteredGames.length == 0 && (
					<p className="clean-p pl-4"> 
						There are no games to display.
					</p>
				)}
				{flex ? (
					<div className="splide-row">
						<Splide
							className="splide-grow"
							options={{
								type: "slide",
								gap: "1rem",
								pagination: false,
								arrows: true,
								fixedWidth: "250px",
								trimSpace: true,
							}}
						>
							{filteredGames.map((game, i) => (
								<SplideSlide key={i}>
									<GameCard
										game={game}
										setSelectedGame={setSelectedGame}
										setGenre={setGenre}
									/>
								</SplideSlide>
							))}
						</Splide>

						<style>{`
						.splide-grow { flex: 1 1 0%; width: 200px; } /* arbitrary width to trigger measurement */
						`}</style>
					</div>
				) : (
					<div className="game-list-grid">
						{filteredGames.map((game, i) => (
							<GameCard
								key={i}
								game={game}
								setSelectedGame={setSelectedGame}
								setGenre={setGenre}
							/>
						))}
					</div>
				)}

				<style>{`
    /* Keep wrapper stacked so the title stays above */
    .game-list-wrapper { display: block; }

    /* Apply the flex hack ONLY to the row with Splide */
    .splide-row { display: flex; }
    .splide-grow { flex: 1 1 0%; width: 200px; } /* arbitrary width to trigger measurement */
  `}</style>
			</div>
		</div>
	);
};

const GameCard: React.FC<{
	game: Game;
	setSelectedGame: (game: Game) => void;
	setGenre: (genre: string) => void;
}> = React.memo(({ game, setSelectedGame, setGenre }) => {
	const isFlash = game.type.includes("html");

	return (
		<div className="card" onClick={() => setSelectedGame(game)}>
			{/* Game image */}
			<img
				src={game.image}
				alt={game.name}
				loading="lazy"
				className="img__img"
			/>

			{/* Overlay */}
			<div
				className={
					isFlash
						? "img__description_layer" // only fades in on hover
						: "absolute inset-0 p-2 backdrop-blur backdrop-brightness-75 opacity-100"
				}
			>
				<h2 className="text-xl font-bold">{game.name}</h2>
				<p className="text-base flex-grow">
					{game.description
						? `${game.description.substring(0, 100)}...`
						: "Click to play!"}
				</p>

				{/* Tags */}
				<div className="card-tags">
					{game?.types?.length == 3 && game.types.slice(0, 3).map(
						(type, idx) =>
							type && (
								<span
									key={idx}
									className="card-tag"
									onClick={(e) => {
										e.stopPropagation();
										setGenre(type);
									}}
								>
									{type}
								</span>
							)
					)}
				</div>
			</div>
		</div>
	);
});

export default GameList;
