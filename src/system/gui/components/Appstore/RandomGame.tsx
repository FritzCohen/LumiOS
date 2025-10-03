import { useState, useEffect, useRef, useMemo } from "react";
import { Game } from "../../../apps/Appstore/appstoreTypes";
import Button from "../../../lib/Button";

interface RandomGameProps {
	games: Game[];
	setSelectedGame: (game: Game) => void; // kept in props but unused here
}

const visibleSymbols = 3;
const numberOfReels = 3;

const RandomGame: React.FC<RandomGameProps> = ({ games: g, setSelectedGame }) => {
	const games = useMemo(() => g.filter((game) => game.type === "html"), [g]);

	const [spinning, setSpinning] = useState(false);
	const [winningGame, setWinningGame] = useState<Game | null>(null);
	const [currentPosition, setCurrentPosition] = useState(1); // center row by default

	const animationRef = useRef<number | null>(null);
	const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Fallback game
	const fallbackGame: Game = {
		name: "Loading...",
		description: "",
		image: "",
		path: "",
		types: ["", "", ""],
		type: "html",
	};

	const initialGame = games[0] || fallbackGame;

	// Utility to build a 3-row column with idx centered
	const buildTriple = (idx: number, list: Game[]) => {
		const n = list.length || 1;
		return [
			list[(idx - 1 + n) % n] || initialGame,
			list[idx % n] || initialGame,
			list[(idx + 1) % n] || initialGame,
		];
	};

	// Initialize reels with center visible
	const initializeReels = () => {
		const idx = games.length ? 0 : 0;
		const triple = buildTriple(idx, games.length ? games : [initialGame]);
		return Array.from({ length: numberOfReels }, () => triple);
	};

	const [reels, setReels] = useState<Game[][]>(initializeReels);

	// Reset when games change
	useEffect(() => {
		setReels(initializeReels());
		setWinningGame(null);
		setCurrentPosition(1); // ensure center is showing
	}, [games]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationRef.current)
				cancelAnimationFrame(animationRef.current);
			if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
		};
	}, []);

	const spinReels = () => {
		if (!games.length || spinning) return;

		// clear any straggler timers/frames
		if (animationRef.current) cancelAnimationFrame(animationRef.current);
		if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);

		setSpinning(true);
		setWinningGame(null);

		const winningGameIndex = Math.floor(Math.random() * games.length);
		const winner = games[winningGameIndex];

		let spinIterations = 0;
		const maxIterations = 40;

		const animateSpin = () => {
			spinIterations++;

			// During spin: randomize each reel, keep a “centered triple” so the translate aligns
			const randomized = Array.from({ length: numberOfReels }, () => {
				const idx = Math.floor(Math.random() * games.length);
				return buildTriple(idx, games);
			});

			setReels(randomized);
			setCurrentPosition((prev) => (prev + 1) % visibleSymbols);

			if (spinIterations < maxIterations) {
				const slowdownFactor = 1 + (spinIterations / maxIterations) * 3;
				const delay = Math.min(50 * slowdownFactor, 200);
				spinTimeoutRef.current = setTimeout(() => {
					animationRef.current = requestAnimationFrame(animateSpin);
				}, delay);
			} else {
				// Final reveal: winner centered on all reels + reset translate to center
				const finalTriple = buildTriple(winningGameIndex, games);
				const finalReels = Array.from(
					{ length: numberOfReels },
					() => finalTriple
				);

				// stop any pending loops
				if (animationRef.current)
					cancelAnimationFrame(animationRef.current);
				if (spinTimeoutRef.current)
					clearTimeout(spinTimeoutRef.current);

				setReels(finalReels);
				setCurrentPosition(1); // show center row
				setWinningGame(winner);
				setSpinning(false);
			}
		};

		animationRef.current = requestAnimationFrame(animateSpin);
	};

	return (
		<div className="flex flex-col items-center justify-center my-8 p-6 w-full bg-primary shadow-sm">
			<h3 className="text-3xl font-bold mb-6 text-white">
				Find Your Next Game!
			</h3>

			<div className="relative mb-8 w-full">
				{/* Reel container */}
				<div className="flex gap-2 mb-6 h-[150px] overflow-hidden relative bg-black rounded-lg p-2">
					{reels.map((reel, reelIndex) => (
						<div
							key={`reel-${reelIndex}`}
							className="flex-1 h-full overflow-hidden relative rounded-lg"
						>
							<div
								className="w-full h-full transition-transform duration-300 ease-out"
								style={{
									transform: `translateY(-${
										currentPosition * 100
									}%)`,
								}}
							>
								{reel.map((game, gameIndex) => (
									<div
										key={`cell-${reelIndex}-${
											game?.path || game?.name || "x"
										}-${gameIndex}`}
										className="w-full h-full flex items-center justify-center overflow-hidden relative"
									>
										<img
											src={game?.image || ""}
											alt={game?.name || "Loading..."}
											className="w-full h-full object-cover"
											draggable={false}
										/>

										{/* Highlight only when winner is centered and spin stopped */}
										{winningGame &&
											!spinning &&
											gameIndex === 1 &&
											game?.path ===
												winningGame?.path && (
												<>
													<div className="absolute inset-0 border-4 border-yellow-400 rounded-lg shadow-lg" />
													<div className="absolute inset-0 bg-yellow-300 opacity-20 animate-pulse" />
													<div className="absolute top-0 right-0 w-6 h-6 bg-yellow-500 rounded-bl-lg flex items-center justify-center">
														<span className="text-xs font-bold">
															★
														</span>
													</div>
												</>
											)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Decorative top and bottom */}
				<div className="absolute -top-2 left-0 right-0 h-4 bg-yellow-500 rounded-t-lg" />
				<div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-500 rounded-b-lg" />

				{/* Winner label */}
				<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
					<div className="text-white font-semibold bg-red-600 px-4 py-1 rounded-full shadow-lg">
						{winningGame
							? `Winner: ${winningGame.name}`
							: "Spin to win!"}
					</div>
				</div>
			</div>
            <div className="flex flex-row gap-2">
                <Button onClick={spinReels} disabled={spinning || !games.length}>
                    {spinning ? (
                        <span className="flex items-center">
                            <span className="animate-spin mr-2">🎰</span>{" "}
                            Spinning...
                        </span>
                    ) : (
                        <span>SPIN TO WIN!</span>
                    )}
                </Button>
                {!spinning && winningGame && (
                    <Button onClick={() => setSelectedGame(winningGame)}>Play Now!</Button>
                )}
            </div>
		</div>
	);
};

export default RandomGame;
