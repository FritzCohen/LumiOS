import { ReactNode, useEffect, useState } from "react";
import "./AppStore.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faGamepad, faHome, faStar, faTrashArrowUp } from "@fortawesome/free-solid-svg-icons";
import Home from "./Home";
import Library from "./Library";
import { Game } from "../../../utils/types";
import GameDescription from "./GameDescription";
import { useKernal } from "../../../Providers/KernalProvider";
import useContextMenu from "../../../components/ContextMenu/useContextMenu";
import ContextMenu from "../../../components/ContextMenu/ContextMenu";
import Recents from "./Recents";
import Favorites from "./Favorites";
import { useApplications } from "../../../Providers/ApplicationProvider";

const Appstore = () => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [installedApps, setInstalledApps] = useState<Game[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [menu, setMenu] = useState<number>(0);
    const [sort, setSort] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { systemProps } = useKernal();
    const { installedApps: apps, deleteInstalledApp } = useApplications();
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const link = systemProps.gamesLink;
                const fetchedGames = await fetch(link);            
                const json: Game[] = await fetchedGames.json();
                
                const matchedGames = json.filter((app) => {
                    return apps.some(game => game.actualName === app.name);
                });
                
                setInstalledApps(matchedGames);
                setGames(json);
            } catch (error) {
                setError(error instanceof Error ? error.message : String(error));
            }            
        };

        fetchGames();
    }, [apps, systemProps.gamesLink]);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0: return <Home sort={sort} games={games} setSelectedGame={setSelectedGame} setSort={setSort} />;
            case 1: return <Recents games={games} setSelectedGame={setSelectedGame} />;
            case 2: return <Favorites games={games} setSelectedGame={setSelectedGame} />
            case 3: return <Library games={installedApps} setSelectedGame={setSelectedGame} />;
            default: return <div />;
        }
    };

    const handleUninstall = async (game: Game) => {
        await deleteInstalledApp(game.name);
    };

    return (
        <div className="w-full h-full flex overflow-hidden appstore">
            <div className="sidebar !p-1 !px-4">
                <div className={`appstore-item ${menu == 0 && "active"}`} onClick={() => { setMenu(0); setSelectedGame(null)}} onContextMenu={(e) => showContextMenu(e, [], ".appstore")}>
                    <FontAwesomeIcon icon={faHome} />
                    <h3>Home</h3>
                </div>
                <div className={`appstore-item ${menu == 1 && "active"}`} onClick={() => { setMenu(1); setSelectedGame(null)}} onContextMenu={(e) => showContextMenu(e, [], ".appstore")}>
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                    <h3>Recents</h3>
                </div>
                <div className={`appstore-item ${menu == 2 && "active"}`} onClick={() => { setMenu(2); setSelectedGame(null)}} onContextMenu={(e) => showContextMenu(e, [], ".appstore")}>
                    <FontAwesomeIcon icon={faStar} />
                    <h3>Favorites</h3>
                </div>
                <div className={`appstore-item ${menu == 3 && "active"}`} onClick={() => { setMenu(3); setSelectedGame(null)}} onContextMenu={(e) => showContextMenu(e, [], ".appstore")}>
                    <svg className="invert" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve" fill="#000000"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g><g> <path className="st0" d="M94.972,55.756H30.479C13.646,55.756,0,69.407,0,86.243v342.279c0,16.837,13.646,30.47,30.479,30.47h64.493 c16.833,0,30.479-13.634,30.479-30.47V86.243C125.452,69.407,111.805,55.756,94.972,55.756z M98.569,234.237H26.882v-17.922h71.687 V234.237z M98.569,180.471H26.882v-35.843h71.687V180.471z"></path> <path className="st0" d="M238.346,55.756h-64.493c-16.833,0-30.479,13.651-30.479,30.487v342.279c0,16.837,13.646,30.47,30.479,30.47 h64.493c16.833,0,30.479-13.634,30.479-30.47V86.243C268.825,69.407,255.178,55.756,238.346,55.756z M241.942,234.237h-71.687 v-17.922h71.687V234.237z M241.942,180.471h-71.687v-35.843h71.687V180.471z"></path> <path className="st0" d="M510.409,398.305L401.562,73.799c-5.352-15.961-22.63-24.554-38.587-19.208l-61.146,20.512 c-15.961,5.356-24.559,22.63-19.204,38.592L391.472,438.2c5.356,15.962,22.63,24.555,38.587,19.208l61.146-20.512 C507.166,431.541,515.763,414.267,510.409,398.305z M326.677,160.493l67.967-22.796l11.398,33.988l-67.968,22.796L326.677,160.493z M355.173,245.455l-5.701-16.994l67.968-22.796l5.696,16.994L355.173,245.455z"></path> </g> </g></svg>
                    <h3>Library</h3>
                </div>
                <p className="px-2 font-semibold mt-4">Installed: </p>
                <div className="flex flex-col gap-2">
                    {installedApps.length == 0 && (
                        <div className="appstore-item max-w-32 text-xs" style={{ color: "lightgrey" }} onContextMenu={(e) => showContextMenu(e, [
                            { name: "Install some games weirdo", action() { alert("Open file explorer and go to Documents") }, }
                        ], ".appstore")}>
                            Your installed games will appear here!
                        </div>
                    )}
                    {installedApps.map((game, index) => (
                        <div className={`appstore-item ${selectedGame?.name === game.name && "active"}`} onClick={() => { setSelectedGame(game); }} key={index} onContextMenu={(e) => showContextMenu(e, [
                            { name: "Play", action: () => setSelectedGame(game), icon: faGamepad },
                            { name: "Uninstall", action: () => handleUninstall(game), icon: faTrashArrowUp },
                        ], ".appstore")}>
                            <img className="aspect-square h-6 mr-2" src={game.image || game?.svg } alt={game.name + "-image"} />
                            {game.name}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full h-full flex-grow pl-2 overflow-y-auto overflow-hidden">
                {error}
                { selectedGame ?
                <GameDescription selectedGame={selectedGame} setSelectedGame={setSelectedGame} downloaded={installedApps.some(app => app.name === selectedGame.name)} setSort={setSort} />
                : getMenu() }
            </div>
            {contextMenuVisible && <ContextMenu menuPosition={contextMenuPosition} menuItems={contextMenuItems} hideMenu={hideContextMenu} />}
        </div>
    );
}
 
export default Appstore;