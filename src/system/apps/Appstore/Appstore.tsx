import {
	faClockRotateLeft,
//	faGamepad,
	faHome,
//	faPaintBrush,
//	faPuzzlePiece,
	faStar,
//	faTrashArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./appstore.css";
import Home from "./Menus/Home";
import { useAppstore } from "./useAppstore";
import Genre from "./Menus/Genre";
import GameDetails from "./Menus/GameDetails";
import Recents from "./Menus/Recents";
import Favorites from "./Menus/Favorites";
import Library from "./Menus/Library";
import { useState } from "react";
import { Game } from "./appstoreTypes";
import { useUser } from "../../../context/user/user";
import { useFolderWatcher } from "../../api/useFolderWatcher";
import Extensions from "./Menus/Extensions";
import Themes from "./Menus/Themes";

const Appstore = () => {
	const appstore = useAppstore();

	const [installed, setInstalled] = useState<Game[]>([]);

	const { userDirectory } = useUser();

	useFolderWatcher(`${userDirectory}/DownloadedGames/`, (content) => {
		const names = Object.keys(content);

		const games = appstore.games.filter((game) =>
			names.includes(game.name)
		);        

		setInstalled(games);
	}, [appstore.games]);

	const getMenu = (): React.ReactNode => {
		switch (appstore.menu) {
			case 0:
				return <Home store={appstore} />;
			case 1:
				return (
					<Recents
						games={appstore.games}
						setGenre={appstore.selectGenre}
						setSelectedGame={appstore.selectGame}
					/>
				);
			case 2:
				return (
					<Favorites
						games={appstore.games}
						setGenre={appstore.selectGenre}
						setSelectedGame={appstore.selectGame}
					/>
				);
			case 3:
				return <Library installed={installed} store={appstore} />;
			case 4:
				return <Genre store={appstore} />;
			case 5:
				return <GameDetails store={appstore} />;
            case 6:
                return <Extensions store={appstore} />;
			case 7:
				return <Themes store={appstore} />
			default:
				return <div>How did we get here?</div>;
		}
	};

	return (
		<div className="w-full h-full flex appstore overflow-x-auto whitespace-nowrap">
			{/* Sidebar */}
			<div className="sidebar !p-1 !px-4">
				{/* Options */}
				<div
					className={`appstore-item ${
						appstore.menu == 0 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(0);
					}}
				>
					<FontAwesomeIcon icon={faHome} />
					<h3>Home</h3>
				</div>
				<div
					className={`appstore-item ${
						appstore.menu == 1 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(1);
					}}
				>
					<FontAwesomeIcon icon={faClockRotateLeft} />
					<h3>Recents</h3>
				</div>
				<div
					className={`appstore-item ${
						appstore.menu == 2 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(2);
					}}
				>
					<FontAwesomeIcon icon={faStar} />
					<h3>Favorites</h3>
				</div>
				<div
					className={`appstore-item ${
						appstore.menu == 3 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(3);
					}}
				>
					<svg
						className="invert"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
						viewBox="0 0 512 512"
						xmlSpace="preserve"
						fill="#000000"
					>
						<g strokeWidth="0"></g>
						<g strokeLinecap="round" strokeLinejoin="round"></g>
						<g>
							<g>
								{" "}
								<path
									className="st0"
									d="M94.972,55.756H30.479C13.646,55.756,0,69.407,0,86.243v342.279c0,16.837,13.646,30.47,30.479,30.47h64.493 c16.833,0,30.479-13.634,30.479-30.47V86.243C125.452,69.407,111.805,55.756,94.972,55.756z M98.569,234.237H26.882v-17.922h71.687 V234.237z M98.569,180.471H26.882v-35.843h71.687V180.471z"
								></path>{" "}
								<path
									className="st0"
									d="M238.346,55.756h-64.493c-16.833,0-30.479,13.651-30.479,30.487v342.279c0,16.837,13.646,30.47,30.479,30.47 h64.493c16.833,0,30.479-13.634,30.479-30.47V86.243C268.825,69.407,255.178,55.756,238.346,55.756z M241.942,234.237h-71.687 v-17.922h71.687V234.237z M241.942,180.471h-71.687v-35.843h71.687V180.471z"
								></path>{" "}
								<path
									className="st0"
									d="M510.409,398.305L401.562,73.799c-5.352-15.961-22.63-24.554-38.587-19.208l-61.146,20.512 c-15.961,5.356-24.559,22.63-19.204,38.592L391.472,438.2c5.356,15.962,22.63,24.555,38.587,19.208l61.146-20.512 C507.166,431.541,515.763,414.267,510.409,398.305z M326.677,160.493l67.967-22.796l11.398,33.988l-67.968,22.796L326.677,160.493z M355.173,245.455l-5.701-16.994l67.968-22.796l5.696,16.994L355.173,245.455z"
								></path>{" "}
							</g>{" "}
						</g>
					</svg>
					<h3>Library</h3>
				</div>
				{/*<div
					className={`appstore-item ${
						appstore.menu == 6 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(6);
					}}
				>
                    <FontAwesomeIcon icon={faPuzzlePiece} />
                    <h3>Extensions</h3>
                </div>
				<div
					className={`appstore-item ${
						appstore.menu == 7 && "active"
					}`}
					onClick={() => {
						appstore.setMenu(7);
					}}
				>
                    <FontAwesomeIcon icon={faPaintBrush} />
                    <h3>Themes</h3>
                </div>*/}
				{/* Any apps and stuff */}
				<p className="px-2 font-semibold mt-4">Installed: </p>
				<div className="flex flex-col gap-2">
					{installed.length == 0 && (
						<div
							className="appstore-item max-w-32 text-xs"
							style={{
								color: "lightgrey",
							}} /*onContextMenu={(e) => showContextMenu(e, [
                            { name: "Install some games weirdo", action() { alert("Open file explorer and go to Documents") }, }
                        ], ".appstore")}*/
						>
							Your installed games will appear here!
						</div>
					)}
					{installed.map((game, index) => (
						<div
							className={`appstore-item ${
								appstore.selectedGame?.name === game.name &&
								"active"
							}`}
							onClick={() => {
								appstore.selectGame(game);
							}}
							key={
								index
							} /*onContextMenu={(e) => showContextMenu(e, [
                            { name: "Play", action: () => appstore.selectGame(game), icon: faGamepad },
                            { name: "Uninstall", action: () => {}, icon: faTrashArrowUp },
                        ], ".appstore")} */
						>
							<img
								className="aspect-square h-6 mr-2"
								src={game.image || game?.svg}
								alt={game.name + "-image"}
							/>
							{game.name}
						</div>
					))}
				</div>
			</div>
			{/* Content */}
			<div className="overflow-auto w-full flex-grow">{getMenu()}</div>
		</div>
	);
};

export default Appstore;
