import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { File, File as file, Permission, User } from "../utils/types";
import virtualFS from "../utils/VirtualFS";
import defaultFS from "../utils/defaultFS";
import settingsIcon from "../assets/Icons/settings.png";
import discordIcon from "../assets/Icons/discord.png";
import appstoreIcon from "../assets/Icons/app-store.png";
import browserIcon from "../assets/Icons/browser.png";

interface UserContextType {
    users: User[]
    loggedIn: boolean
    currentUser: User | null
    createUser: (user: User) => Promise<void>
    setCurrentUser: (prev: User) => void
    setLoggedIn: (prev: boolean) => void
    fetchUsers: () => Promise<void>
    modifyUserProp: (prev: Partial<User>, id: number | string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            await virtualFS.initialize();
            const users = await virtualFS.readdir("System/Users/");
            const usersContent = Object.keys(users)
                .map((name) => (users[name] as File).content)
                .filter(Boolean);  // Filters out any undefined or null entries
                
            setUsers(usersContent);            
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, []);  // Depend on virtualFS in case it changes
    
    useEffect(() => {
        const loadUsers = async () => {
            try {
                await virtualFS.initialize();
                fetchUsers();  // Call the memoized fetchUsers
            } catch (error) {
                console.error("Error initializing virtual file system:", error);
            }
        };
    
        loadUsers();
    }, [fetchUsers, virtualFS.getInteracted()]);  // Depend on fetchUsers so it's called again if it changes
    
    const createUser = async (user: User) => {
        const usernamePath = `Users/${user.username}/`;

        await Promise.all([
            virtualFS.writeFile("System/Users/", user.username, user, "sys"),
            virtualFS.writeDirectory("Users/", user.username, Permission.ELEVATED),
            virtualFS.writeDirectory(usernamePath, "Apps", Permission.ELEVATED),
            virtualFS.writeDirectory(usernamePath, "AppStore", Permission.ELEVATED),
            virtualFS.writeDirectory(`${usernamePath}AppStore/`, "Favorites", Permission.ELEVATED),
            virtualFS.writeDirectory(`${usernamePath}AppStore/`, "Recents", Permission.ELEVATED),
            virtualFS.writeDirectory(usernamePath, "Code", Permission.ELEVATED),
            virtualFS.writeDirectory(`${usernamePath}Code/`, "Default", Permission.ELEVATED),
            virtualFS.writeDirectory(usernamePath, "Browser", Permission.ELEVATED),
            virtualFS.writeFile(`${usernamePath}Code/Default/`, "index.html", `<!DOCTYPE html>\n<html>\n<head>\n<link rel="stylesheet" href="./styles.css">\n</head>\n<body>\n<h1>Hello World</h1>\n<script src="./index.js"></script>\n</body>\n</html>`, "html"),
            virtualFS.writeFile(`${usernamePath}Code/Default/`, "index.js", `console.log("Hello World");`, "js"),
            virtualFS.writeFile(`${usernamePath}Code/Default/`, "styles.css", `body {\nbackground-color: #f0f0f0;\n }`, "css"),
            virtualFS.writeDirectory(usernamePath, "Desktop", Permission.ELEVATED),
            virtualFS.writeDirectory(usernamePath, "Taskbar", Permission.ELEVATED),
        ]);

        const desktopIcons = [
            { name: "Settings", description: "Change settings for LumiOS.", svg: settingsIcon },
            { name: "Discord", description: "Message friends and users.", svg: discordIcon },
        ];

        const taskbarIcons = [
            { name: "Settings", description: "Change settings for LumiOS.", svg: settingsIcon },
            { name: "AppStore", description: "Download games and plugins.", svg: appstoreIcon },
            { name: "Browser", description: "Search the web.", svg: browserIcon },
        ];

        await Promise.all([
            ...desktopIcons.map(icon => virtualFS.writeFile(`${usernamePath}Desktop/`, icon.name, { ...icon, userInstalled: false }, "app")),
            ...taskbarIcons.map(icon => virtualFS.writeFile(`${usernamePath}Taskbar/`, icon.name, { ...icon, userInstalled: false }, "app")),
            ...Object.keys(defaultFS.root.children.Users.children.Default.children).map(async appName => {
                const app: file = defaultFS.root.children.Users.children.Default.children[appName];
                if (app && 'content' in app) {
                    await virtualFS.writeFile(`${usernamePath}Apps/`, appName, app.content, app.fileType);
                }
            })
        ]);

        setUsers(prev => [...prev, user]);
    };

    const modifyUserProp = async (prop: Partial<User>, id: number | string) => {
        setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(user =>
                (typeof id === "number" ? prevUsers[id] === user : user.username === id) ? { ...user, ...prop } : user
            );

            const updatedUser = updatedUsers.find(user => (typeof id === "number" ? prevUsers[id] === user : user.username === id));

            if (updatedUser) {
                setCurrentUser(updatedUser);
                virtualFS.updateFile("System/Users/", id.toString(), updatedUser, "sys");
            }

            return updatedUsers;
        });
    };

    return ( 
        <UserContext.Provider value={{
            loggedIn,
            setLoggedIn,
            currentUser,
            setCurrentUser,
            users,
            createUser,
            fetchUsers,
            modifyUserProp,
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for using User context
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
