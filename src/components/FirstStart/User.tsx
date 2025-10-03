import { useState } from "react";
import logo from "../../assets/Icons/people.png";
import security from "../../assets/Icons/security.png";
import Button from "../../system/lib/Button";
import virtualFS from "../../utils/VirtualFS";
import { useUser } from "../../Providers/UserProvider";

interface UserProps {
    setMenu: React.Dispatch<React.SetStateAction<number>>; // Supports both number and function
}

interface Cloak {
    name: string;
    link: string;
}

const User: React.FC<UserProps> = ({ setMenu }) => {
    const [website, setWebsite] = useState<string>("https://google.com");
    const [panic, setPanic] = useState<string>("\\");
    const [title, setTitle] = useState<string>("Lumi OS v10");
    const [favicon, setFavicon] = useState<string>("https://avatars.githubusercontent.com/u/101959214?v=4");
    const [login, setLogin] = useState<boolean>(true);
    const { currentUser, modifyUserProp } = useUser();

    const handlePanicSettings = async () => {
        await virtualFS.initialize();
        await virtualFS.deleteFile("System/", "Panic");

        await virtualFS.writeFile("System/", "Panic", {
            key: panic,
            website,
            title,
            favicon,
        }, "sys");

        if (currentUser) {
            await modifyUserProp({
                ...currentUser,
                panic: {
                    key: panic,
                    title,
                    favicon,
                    website,
                }
    
            }, currentUser.username);
        }

        if (!login) {
            await virtualFS.deleteFile("System/", "Autologin");

            await virtualFS.writeFile("System/", "Autologin", login, "sys");
        }
    };

    const handleCloakChange = (cloak: string) => {
        const parsed: Cloak = JSON.parse(cloak);

        if (parsed.name === "Default") return;
        
        setTitle(parsed.name);
        setFavicon(parsed.link);
    };

    // Built in cloaks
    const cloaks: Cloak[] = [
        { name: "Default", link: "" },
        { name: "Google", link: "https://google.com/favicon.ico" },
        { name: "Canvas", link: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
        { name: "Desmos | Graphing Calculator", link: "https://www.desmos.com/assets/img/apps/graphing/favicon.ico" },
        { name: "My Drive - Google Drive", link: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
        { name: "Classroom", link: "https://ssl.gstatic.com/classroom/ic_product_classroom_144.png" },
        { name: "New Tab", link: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABRklEQVR42mKgOqjq75ds7510YNL0uV9nAGqniqwKYiCIHIIjcAK22BGQLRdgBWvc3fnWk/FJhrkPO1xPgGvqPfLfJMHhT1yqurvS48bPaJhjD2efgidnVwa2yv59xecvEvi0UWCXq9t0ItfP2MMZ7nwIpkA8F1n8uLxZHM6yrBH7FIl2gFXDHYsErkn2hyKLHtcKrFntk58uVQJ+kSdQnmjhID4cwLLa8+K0BXsfNWCqBOsFdo2Yldv43DBrkxd30cjnNyYBhK0SQGkI9pG4Mu40D5b374DRCAyhHqXVfTmOwivivMkJxBz5wnHCtBfGgNFC+ChWKWRf3hsQIlyEoIv4IYEo5wkgtBLRekY9DE4Uin4Keae6hydGnljPmE8kRcCine6827AMsJ1IuW9ibnlQpXLBCR/WC875m2BP+VSu3c/0m+8V08OBngc0pxcAAAAASUVORK5CYII=" },
        { name: "Google Docs", link: "https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico" },
        { name: "Edpuzzle", link: "https://edpuzzle.imgix.net/favicons/favicon-32.png" },
        { name: "Dashboard | Khan Academy", link: "https://cdn.kastatic.org/images/favicon.ico?logo" },
        { name: "Latest | Quizlet", link: "https://assets.quizlet.com/a/j/dist/app/i/logo/2021/q-twilight.e27821d9baad165.png" }
    ];

    return (
        <div className="start-box glass flex flex-row items-center justify-evenly w-full h-full p-4">
            <div className="relative w-full flex justify-center mb-4">
                <img src={logo} alt="Main Logo" className="h-32" />
                <img src={security} alt="Small Logo" className="absolute top-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2 h-20" />
            </div>
            <div className="flex flex-col items-center w-full h-full overscroll-y-auto max-w-4xl">
                <div className="flex flex-col flex-grow text-center mb-4 overflow-y-auto py-5">
                    <h3 className="text-2xl font-bold mb-4">Cloak Settings</h3>
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex flex-row gap-2 items-center justify-center">
                            <label htmlFor="website" className="text-lg">Panic Site:</label>
                            <input
                                id="website"
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                placeholder="https://google.com"
                            />
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-center">
                            <label htmlFor="panic" className="text-lg">Panic Key:</label>
                            <input
                                id="panic"
                                type="text"
                                value={panic}
                                onChange={(e) => setPanic(e.target.value)}
                                className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                placeholder="\\"
                            />
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-center">
                            <label htmlFor="title" className="text-lg">Title:</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                placeholder="Lumi OS v10"
                            />
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-center">
                            <label htmlFor="favicon" className="text-lg">Favicon:</label>
                            <input
                                id="favicon"
                                type="text"
                                value={favicon}
                                onChange={(e) => setFavicon(e.target.value)}
                                className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                placeholder="https://avatars.githubusercontent.com/u/101959214?v=4"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Built-in cloaks:</p>
                    <select
                        onChange={(e) => handleCloakChange(e.target.value)}
                        className="bg-secondary cursor-pointer px-2 py-1 shadow-sm hover:bg-primary-light duration-100 ease-in-out transition-colors rounded text-text-base"
                    >
                        {cloaks.map((cloak, index) => (
                            <option value={JSON.stringify(cloak)} key={index}>{cloak.name}</option>
                        ))}
                    </select>
                    <div className="flex flex-row gap-2 items-center justify-center mt-4">
                        <label htmlFor="autologin" className="text-lg">Autologin:</label>
                        <select
                            id="autologin"
                            onChange={(e) => setLogin(e.target.value === "true")}
                            className="bg-secondary cursor-pointer px-2 py-1 shadow-sm hover:bg-primary-light duration-100 ease-in-out transition-colors rounded text-text-base"
                        >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                    <button onClick={handlePanicSettings} className="my-4 bg-primary hover:bg-secondary transition-colors duration-200 rounded">Confirm</button>
                    <p className="text-xs text-gray-600 mt-2">Autologin is enabled by default.</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full mt-4">
                    <Button onClick={() => setMenu((prev) => prev - 1)}>Back</Button>
                    <Button onClick={() => setMenu((prev) => prev + 1)}>Next</Button>
                </div>
            </div>
        </div>
    );
}

export default User;