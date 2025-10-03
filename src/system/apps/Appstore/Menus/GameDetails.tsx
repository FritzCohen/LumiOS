import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Game, useAppstoreProps } from "../appstoreTypes";
import GameList from "../../../gui/components/Appstore/GameList";
import Button from "../../../lib/Button";
import { useKernel } from "../../../../hooks/useKernal";
import PlayGame from "./PlayGame";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faStar } from "@fortawesome/free-solid-svg-icons";
import virtualFS from "../../../api/virtualFS";
import { useUser } from "../../../../context/user/user";
import Zipper from "../../../gui/components/Popups/Zipper";
import TextPopup from "../../../gui/components/Popups/TextPopup";

const GameDetails: React.FC<{ store: useAppstoreProps }> = ({ store }) => {
	const game = useMemo(() => {
		return store.selectedGame as Game;
	}, [store.selectedGame]);

	const { openApp } = useKernel();
	const { userDirectory, currentUser } = useUser();

	const [downloaded, setDownloaded] = useState<boolean>(false);
	const [starred, setStarred] = useState<boolean>(false);

	const getDownloaded = useCallback(async () => {
		return await virtualFS.exists(
			`${userDirectory}/DownloadedGames/`,
			game.name
		);
	}, [userDirectory, game.name]);

	const getStarred = useCallback(async () => {
		return await virtualFS.exists(
			`${userDirectory}/AppStore/Favorites/`,
			game.name
		);
	}, [userDirectory, game.name]);

	const handleStar = async () => {
		const dir = `${userDirectory}/AppStore/Favorites/`;
		if (await virtualFS.exists(dir, game.name)) {
			await virtualFS.deleteFile(dir, game.name);
			setStarred(false);
		} else {
			await virtualFS.writeFile(dir, game.name, game, "txt");
			setStarred(true);
		}
	};

	const handleRecents = useCallback(async () => {
		const dirContent = await virtualFS.readdir(
			`${userDirectory}/AppStore/Recents/`
		);

		const length = Object.keys(dirContent).length;

		if (length > 15) {
			const name = Object.keys(dirContent)[length];
			await virtualFS.deleteFile(
				`${userDirectory}/AppStore/Recents/`,
				name
			);
		}

		await virtualFS.writeFile(
			`${userDirectory}/AppStore/Recents/`,
			game.name,
			game,
			"txt"
		);
	}, [userDirectory, game]);

	useEffect(() => {
		const check = async () => {
			setDownloaded(await getDownloaded());
			setStarred(await getStarred());
			handleRecents();
		};

		check();
	}, [getDownloaded, getStarred, handleRecents]);

	const handleItemOpen = async () => {
		openApp({
			config: {
				name: `${game.name}`,
				displayName: `Play ${game.name}`,
				permissions: 1,
				icon: game.image,
			},
			mainComponent: (props) => (
				<PlayGame game={game} cloudPlay={!downloaded} {...props} />
			),
		});
	};

	const handleDownload = async () => {
		if (downloaded) {
			// 🔹 Remove downloaded game
			await virtualFS.deleteFile(
				`${userDirectory}/DownloadedGames/`,
				game.name
			);
			await virtualFS.deleteFile(`${userDirectory}/Apps/`, game.name);
			setDownloaded(false);
			return;
		}

		// 🔹 Otherwise, do download logic
		if (!(await virtualFS.exists(userDirectory, "DownloadedGames"))) {
			await virtualFS.writeDirectory(
				userDirectory,
				"DownloadedGames",
				currentUser?.permission || 1
			);
		}

		const gameDir = `${userDirectory}/DownloadedGames/${game.name}`;
		if (
			!(await virtualFS.exists(
				`${userDirectory}/DownloadedGames/`,
				game.name
			))
		) {
			await virtualFS.writeDirectory(
				`${userDirectory}/DownloadedGames/`,
				game.name,
				currentUser?.permission || 1
			);
		}

		const fileName = game.path.split("/").pop() || "index.html";

		await virtualFS.writeFile(
			`${userDirectory}/Apps/`,
			game.name, // shortcut file itself, named after the game
			{
				name: fileName, // actual file inside DownloadedGames
				path: `${userDirectory}/DownloadedGames/${game.name}/`,
			},
			"shortcut"
		);

		const res = await fetch(game.path);
		const buffer = await res.arrayBuffer();

		const isZip =
			game.path.endsWith(".zip") ||
			res.headers.get("content-type")?.includes("zip");

		if (isZip) {
			openApp({
				config: {
					name: "Zipper",
					displayName: `Extracting ${game.name}`,
					permissions: 1,
					icon: game.image,
				},
				mainComponent: (props) => (
					<Zipper
						zippedContent={buffer}
						targetDir={gameDir}
						permission={currentUser?.permission || 1}
						onDone={async () =>
							setDownloaded(await getDownloaded())
						} // ✅ Refresh state when unzip done
						{...props}
					/>
				),
			});
		} else {
			// keep it binary if it’s a swf
			if (game.type === "swf") {
				await virtualFS.writeFile(
					gameDir,
					fileName,
					new Uint8Array(buffer),
					"swf"
				);
			} else {
				// only decode text formats like html, js, css, etc.
				const text = new TextDecoder().decode(buffer);
				await virtualFS.writeFile(gameDir, fileName, text, game.type);
			}

			setDownloaded(true);
		}
	};

	const handleDescriptionOpen = () => {
		openApp({
			config: {
				name: `${game.name.slice(0,1).toUpperCase()+game.name.slice(1)} Description`,
				displayName: `${game.name.slice(0,1).toUpperCase()+game.name.slice(1)} Description`,
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<TextPopup {...props} text={game.description} onComplete={() => {}} />
			),
		});
	};

	return (
		<div className="flex flex-col w-full min-h-screen bg-black text-white pb-20">
			{/* Hero section */}
			<div className="relative w-full max-w-5xl mx-auto">
				{/* Image background */}
				<img
					src={game.image}
					alt={game.name}
					className="w-full h-[60vh] object-cover blur brightness-50"
					style={{
						WebkitMaskImage:
							"linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)",
						WebkitMaskRepeat: "no-repeat",
						WebkitMaskSize: "100% 100%",
						maskImage:
							"linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)",
						maskRepeat: "no-repeat",
						maskSize: "100% 100%",
					}}
				/>

				{/* Overlay content */}
				<div className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-6 text-center">
					<h1 className="text-4xl font-bold drop-shadow-lg">
						{game.name}
					</h1>
					<div className="flex flex-row gap-4">
						<Button
							className="!flex flex-row gap-2"
							onClick={handleItemOpen}
						>
							<span>Play</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 invert"
								viewBox="0 0 640 512"
							>
								<path d="M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z" />
							</svg>
						</Button>
						<Button onClick={handleDownload}>
							{downloaded ? "Remove" : "Download"}{" "}
							<FontAwesomeIcon icon={faDownload} />
						</Button>
						<Button
							className="flex justify-center items-center"
							onClick={handleStar}
						>
							{!starred ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
									/>
								</svg>
							) : (
								<FontAwesomeIcon icon={faStar} />
							)}
						</Button>
					</div>
					{game.type === "html" && (
						<div className="flex flex-row gap-2">
							{game.types.map((type, index) => (
								<React.Fragment key={index}>
									<span
										onClick={() => {
											store.selectGenre(type);
										}}
										className="cursor-pointer"
									>
										{type}
									</span>
									{index < game.types.length - 1 && (
										<span style={{ color: "gray" }}>|</span>
									)}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Description */}
			{game.type === "html" && <div className="relative max-w-3xl mx-auto px-6 mt-6 mb-10 text-lg flex items-center">
				<span
					className="truncate pr-2 relative max-w-full"
					style={{
						WebkitMaskImage:
							"linear-gradient(to right, black 80%, transparent 100%)",
						maskImage:
							"linear-gradient(to right, black 80%, transparent 100%)",
					}}
				>
					{game.description.slice(0, 200)}
				</span>
				<span
					className="text-blue-600 cursor-pointer flex-shrink-0"
					onClick={handleDescriptionOpen}
				>
					See more...
				</span>
			</div>}

			{/* Related games */}
			{game.type === "html" && (
				<>
					<GameList
						title={
							game.types[0].slice(0, 1).toUpperCase() +
							game.types[0].slice(1)
						}
						sort={game.types[0]}
						games={store.games}
						setGenre={store.selectGenre}
						setSelectedGame={store.selectGame}
						flex
					/>
					<GameList
						title={
							game.types[1].slice(0, 1).toUpperCase() +
							game.types[1].slice(1)
						}
						sort={game.types[1]}
						games={store.games}
						setGenre={store.selectGenre}
						setSelectedGame={store.selectGame}
						flex
					/>
					<GameList
						title={
							game.types[2].slice(0, 1).toUpperCase() +
							game.types[2].slice(1)
						}
						sort={game.types[2]}
						games={store.games}
						setGenre={store.selectGenre}
						setSelectedGame={store.selectGame}
						flex
					/>
				</>
			)}
		</div>
	);
};

export default GameDetails;
