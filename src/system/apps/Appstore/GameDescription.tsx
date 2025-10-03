import { useEffect, useState } from "react";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCloud, faDeleteLeft, faDownload, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { Game } from "../../../utils/types";
import virtualFS from "../../../utils/VirtualFS";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useUser } from "../../../Providers/UserProvider";
import SWFPlayer from "./SWFPlayer";

interface GameDescriptionProps {
    selectedGame: Game | null;
    downloaded: boolean
    setSelectedGame: (prev: Game | null) => void;
    setSort: (prev: string) => void
}

const GameDescription: React.FC<GameDescriptionProps> = ({ selectedGame, downloaded, setSelectedGame, setSort }) => {
    const [starred, setStarred] = useState<boolean>(false);
    const [showIFrame, setShowIFrame] = useState<boolean>(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);
    const [content, setContent] = useState<string>("");
    const [percentDownloaded, setPercentDownloaded] = useState<number>(0);
    const { installedApps: apps, addInstalledApp, deleteInstalledApp } = useApplications();
    const { currentUser } = useUser();

    useEffect(() => {
        console.log(selectedGame, downloaded);
        
        const getStarredGame = async () => {
            if (!selectedGame || !currentUser) return;
            const directory = `Users/${currentUser.username}/AppStore`;

            await virtualFS.initialize();
            const starredGames = await virtualFS.readdir(`${directory}/Favorites/`);
            const allGames = Object.keys(starredGames);

            if (allGames.includes(selectedGame.name)) {
                setStarred(true);
            }

            // Save the game as recently played
            
            await virtualFS.writeFile(`${directory}/Recents/`, selectedGame.name, JSON.stringify(selectedGame), "sys");
            const allRecents = await virtualFS.readdir(`${directory}/Recents/`);

            // Assuming `allRecents` is an object with file paths as keys and File objects as values
            if (Object.keys(allRecents).length > 8) {
                // Convert `allRecents` object to an array of entries for easier manipulation
                const entries = Object.entries(allRecents);
                
                // Find the entry with the oldest date
                const oldestEntry = entries.reduce((oldest, current) => {
                    const oldestDate = new Date(oldest[1].date);
                    const currentDate = new Date(current[1].date);
                    return currentDate < oldestDate ? current : oldest;
                });

                // Extract the file path or identifier for deletion
                const filePathToDelete = oldestEntry[0]; // Assuming the file path is the key

                // Delete the oldest file
                await virtualFS.deleteFile(`${directory}/Favorites/`, filePathToDelete);

                console.log(`Deleted file: ${filePathToDelete}`);
            }
        }

        getStarredGame();
    }, []);

    const getCloudContent = async () => {        
        if (!selectedGame) return;

        setShowLoadingScreen(true);

        if (selectedGame.type === "html") {
            const content = await fetch(selectedGame.path);
            const text = await content.text();
    
            setContent(text);
        }

        setShowLoadingScreen(false);
        setShowIFrame(true);
    }

    const getDownloadContent = async () => {        
        if (!selectedGame) return;

        setShowLoadingScreen(true);

        if (selectedGame.type === "html") {
            const content = apps.find(app => app.name === selectedGame.name);
            
            setContent(content?.fileContent || "");
        }

        setShowLoadingScreen(false);
        setShowIFrame(true);
    }

    const handleDownload = async () => {
        if (!selectedGame) return;

        const response = await fetch(selectedGame.path);
    
        if (!response.body) {
            console.error('ReadableStream not supported');
            return;
        }
    
        const totalBytes = Number(response.headers.get('Content-Length')) || 0;
        let loadedBytes = 0;
    
        const reader = response.body.getReader();

    
        const stream = new ReadableStream({
            async start(controller) {
                const processText = async () => {
                    const { done, value } = await reader.read();
    
                    if (done) {
                        controller.close();
                        return;
                    }
    
                    loadedBytes += value.length;
    
                    // Update progress
                    const percent = Math.min(Math.round((loadedBytes / totalBytes) * 100), 100);
                    setPercentDownloaded(percent);
    
                    // Introduce artificial delay (e.g., 50ms per chunk) for testing purposes
                    await new Promise(resolve => resolve(value));
    
                    controller.enqueue(value);
                    processText();
                };
    
                processText();
            }
        });
    
        // Convert the stream into text
        const content = new Response(stream);
        const text = await content.text();
    
        await addInstalledApp({
            name: selectedGame.name,
            actualName: selectedGame.name,
            description: selectedGame.description,
            userInstalled: true,
            svg: selectedGame.image || selectedGame?.svg,
            fileContent: text, // because why not.
            path: selectedGame?.path,
        })
    };

    const handleStarred = async () => {
        if (!selectedGame || !currentUser) return;
        const directory = `Users/${currentUser.username}/AppStore`;

        const starredGames = await virtualFS.readdir(`${directory}/Favorites/`);
        const allGames = Object.keys(starredGames);

        if (!allGames.includes(selectedGame.name)) {
            await virtualFS.writeFile(`${directory}/Favorites/`, selectedGame.name, JSON.stringify(selectedGame), "sys");

            setStarred(true);
        } else {
            await virtualFS.deleteFile(`${directory}/Favorites/`, selectedGame.name);

            setStarred(false);
        }
    }

    return ( 
        <div className="w-full h-full overflow-hidden">
            {showLoadingScreen ? <>
                <div>loading...</div>
            </> : showIFrame ? 
            <div className="h-full relative overflow-hidden">
                <div className="absolute p-2 z-20 right-0">
                    <Button onClick={() => setShowIFrame(false)}>Back <FontAwesomeIcon icon={faChevronLeft} /></Button>
                </div>
                {selectedGame?.type === "swf" ? 
                <SWFPlayer path={selectedGame.path} />
                :
                <iframe
                className="w-full h-full"
                srcDoc={content || "<p>Loading...</p>"}
                />
                }
            </div>
            :
            <div className="flex flex-col relative h-full">
                <div className="absolute p-2 z-20 right-0">
                    <Button onClick={() => setSelectedGame(null)}>Back <FontAwesomeIcon icon={faChevronLeft} /></Button>
                </div>
                <img src={selectedGame?.image || selectedGame?.svg } alt={selectedGame?.name} className="w-full h-full overflow-hidden object-cover absolute blur brightness-50" />
                <div className="flex items-center justify-center relative h-full">
                    <div className="w-1/3 min-w-[350px] text-white p-8 z-10">
                    <h3 className="text-2xl font-semibold mb-4">{selectedGame?.name}</h3>
                    <div className="flex flex-row gap-4">
                        <Button onClick={getCloudContent} className="flex gap-2 flex-row h-fit justify-between bg-[]">
                            Cloud Play
                            <FontAwesomeIcon icon={faCloud} />
                        </Button>
                        <div className="group">
                            {selectedGame?.type === "swf" &&     
                            <>                    
                                <div className={`text-text-base pointer-events-none absolute z-50 bg-primary-light rounded px-2 -translate-y-5 translate-x-5 origin-bottom scale-0 ease-linear duration-100 group-hover:scale-100`}>
                                    <p>Downloads are disabled for flash games.</p>
                                </div>
                                
                                <Button onClick={handleDownload} className="flex gap-2 group-hover:scale-100" disabled={selectedGame?.type === "swf"}>
                                    Download
                                    <FontAwesomeIcon icon={faDownload} />
                                </Button>
                            </>
                            }
                            {selectedGame?.type === "html" && (
                            <>
                            {!downloaded ? 
                            <Button onClick={handleDownload} className="flex gap-2 group-hover:scale-100">
                                {percentDownloaded == 100 ? "Downloaded" : "Download"} {percentDownloaded !== 0 && percentDownloaded !== 100 && <>{percentDownloaded}%</>}
                                <FontAwesomeIcon icon={faDownload} />
                            </Button>
                            :
                            <Button onClick={getDownloadContent} className="flex gap-2 group-hover:scale-100">
                                Play
                                <FontAwesomeIcon icon={faGamepad} />
                            </Button>
                            }
                            {downloaded && 
                            <Button onClick={() => {
                                deleteInstalledApp(selectedGame.name);
                                setSelectedGame(null);
                            }} className="my-2">
                                Delete <FontAwesomeIcon icon={faDeleteLeft} />
                            </Button>
                            }
                            </>
                            )}
                        </div>
                        <button className="flex justify-center items-center p-0 rounded" onClick={handleStarred}>       
                            {!starred ?
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                            }
                        </button>
                    </div>
                    <Button className="my-2" onClick={() => {}}>Read more...</Button>
                    <ul className="my-2 gap-2 text-gray-300">
                    {selectedGame?.types?.length && (
                    <>
                        <li>
                        <button
                            onClick={() => {
                            setSort(selectedGame.types?.[0] ?? '');
                            setSelectedGame(null);
                            }}
                        >
                            <div>{selectedGame.types?.[0]}</div>
                        </button>
                        </li>
                        <hr className="w-1/2 border-t border-gray-500 my-2" />
                        <li>
                        <button
                            onClick={() => {
                            setSort(selectedGame.types?.[1] ?? '');
                            setSelectedGame(null);
                            }}
                        >
                            <div>{selectedGame.types?.[1]}</div>
                        </button>
                        </li>
                        <hr className="w-1/2 border-t border-gray-500 my-2" />
                        <li>
                        <button
                            onClick={() => {
                            setSort(selectedGame.types?.[2] ?? '');
                            setSelectedGame(null);
                            }}
                        >
                            <div>{selectedGame.types?.[2]}</div>
                        </button>
                        </li>
                    </>
                    )}
                    </ul>
                    </div>
                </div>
            </div>
            }

        </div>
    );
}
 
export default GameDescription;