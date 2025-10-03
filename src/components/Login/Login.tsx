import { FormEvent, useEffect, useState } from "react";
import { File, Permission, User, Theme } from "../../utils/types";
import { useUser } from "../../Providers/UserProvider";
import "./Login.css";
import Battery from "./Battery";
import Button from "../../system/lib/Button";
import userIcon from "../../assets/no-bg-logo.png";
import virtualFS from "../../utils/VirtualFS";
import defaultBG from "../../assets/background/bg1.avif";
import Select from "../../system/lib/Select";

const Login = () => {
    const [showUsers, setShowUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [themes, setThemes] = useState<({ value: Theme, name: string })[]>([]);

    // New user settings
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [permission, setPermission] = useState<Permission>(Permission.USER);
    const [autologin, setAutologin] = useState<boolean>(true);
    const [theme, setTheme] = useState<Theme | null>(null);
    
    const [error, setError] = useState<string>("");
    const [showSignInMenu, setShowSignInMenu] = useState(false);
    const [showSignUpMenu, setShowSignUpMenu] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState<number>(0);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);
    const { users, setCurrentUser, setLoggedIn, createUser, fetchUsers } = useUser();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (lockoutTime) {
            intervalId = setInterval(() => {
                if (Date.now() > lockoutTime) {
                    setFailedAttempts(0);
                    setLockoutTime(null);
                    setError("");
                    clearInterval(intervalId);
                } else {
                    const secondsRemaining = Math.ceil((lockoutTime - Date.now()) / 1000);
                    setError(`Too many failed attempts. Try again in ${secondsRemaining} seconds.`);
                }
            }, 1000); // Update every second
        }

        return () => clearInterval(intervalId);
    }, [lockoutTime]);

    const handleClick = () => {
        setShowUsers(true);
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setCurrentUser(user);        
        setShowSignInMenu(true);
        setShowSignUpMenu(false);
    };

    const handleSignUpClick = async () => {
        setSelectedUser(null);
        setShowSignInMenu(false);
        setShowSignUpMenu(true);

        const storedThemes = await virtualFS.readdir("System/Themes");
                        
        const names = Object.keys(storedThemes);
        const values = Object.keys(storedThemes).map(theme => (storedThemes[theme] as File).content);
        
        const combinedValues = names.map((value: string, index: number) => ({ name: value, value: values[index] }));
        setThemes(combinedValues);
    };

    const handleSignUp = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        createUser({
            username: username,
            password: password,
            svg: userIcon,
            permission: permission,
            autoLogin: autologin,
            theme: theme == null ? themes[0].value : theme,
            backgroundImage: defaultBG,
            panic: {
                key: "\\",
                title: "Lumi OS",
                favicon: userIcon,
                website: "https://google.com",
            }
        });
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();

        if (lockoutTime) {
            setError(`Too many failed attempts. Try again in ${Math.ceil((lockoutTime - Date.now()) / 1000)} seconds.`);
            return;
        }

        if (!selectedUser) return;

        if (password === selectedUser.password) {
            setCurrentUser(selectedUser);
            setLoggedIn(true);
            setFailedAttempts(0); // Reset failed attempts on successful login
            setShowSignInMenu(false);
        } else {
            setError("Password is not correct.");
            setFailedAttempts(prev => prev + 1);

            if (failedAttempts >= 4) {
                // Lockout user for 2 minutes
                setLockoutTime(Date.now() + 2 * 60 * 100);
                setError("Too many failed attempts. Please wait 2 minutes before trying again.");
            } else {
                setTimeout(() => {
                    setError("");
                }, 5000);
            }
        }
    };

    return (
        <div className="login" onClick={handleClick} style={{ backgroundImage: defaultBG }}>
            <div className={`background ${showUsers ? 'blurred' : ''}`}></div>
            <div className={`splashScreen ${showUsers ? 'hidden' : ''}`}>
                <div className="text-6xl font-semibold text-gray-100">
                    {new Date().toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    })}
                </div>
                <div className="text-lg font-medium text-gray-200">
                    {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>
            <div className={`fadeinScreen ${showUsers ? 'show' : ''}`}>
                {users.length > 0 ? (
                    <div className="crystal p-2">
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className="glass p-2 saturate-150 backdrop-brightness-150 my-1"
                                onClick={() => handleUserClick(user)}
                            >
                                {user.username}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-2xl font-medium text-gray-200">
                        No users found
                    </div>
                )}
                <div
                onClick={handleSignUpClick}
                    className="glass p-2 m-2 saturate-150 backdrop-brightness-150"
                >
                    Create User
                </div>
            </div>
            <div className="bottomInfo flex">
                <Battery />
            </div>

            {/* Sign-In Menu */}
            {showSignInMenu && (
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-5 flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-center items-center">
                        <img src={typeof selectedUser?.svg === "string" ? selectedUser.svg : ""} alt="userProfile" className="w-16 h-16 rounded-full" />
                        <form onSubmit={handleSignIn} className="flex flex-col justify-center items-center p-2">
                            <div className={`relative my-2 w-full px-5`}>
                                <input
                                    type="text"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                    placeholder="Password"
                                />
                            </div>
                            <p style={{ color: "red" }}>{ error }</p>
                            <Button type="submit" className="btn">Sign In</Button>
                        </form>
                    </div>
                </div>
            )}
            {/* Sign-Up Menu */}
            {showSignUpMenu && (
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-5 flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-center items-center">
                        <img src={userIcon} alt="userProfile" className="w-16 h-16 rounded-full" />
                        <form onSubmit={(e) => handleSignUp(e)} className="flex flex-col justify-center items-center p-2">
                            <div className={`relative flex flex-col gap-2 my-2 w-full px-5`}>
                                <input
                                    type="text"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                    placeholder="Username"
                                />
                                <input
                                    type="text"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                                    placeholder="Password"
                                />
                            </div>
                            <div className="flex flex-col gap-1 w-fit">
                                <span>User access level: </span>
                                <Select 
                                    id="permission" 
                                    onChange={(e) => setPermission(Number(e.target.value) as Permission)} 
                                    defaultValue={Permission.USER}
                                >
                                    <option value={Permission.SYSTEM}>System (NOT RECOMENDED)</option>
                                    <option value={Permission.ELEVATED}>Elevated</option>
                                    <option value={Permission.USER}>User</option>
                                </Select>
                                <span>Autologin: </span>
                                <Select
                                    id="autologin" 
                                    onChange={(e) => setAutologin(Boolean(e.target.value))} 
                                    defaultValue={"true"}
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </Select>
                                <span>Current theme: </span>
                                <Select
                                    onChange={(e) => setTheme(themes[parseInt(e.target.value)].value)}
                                >
                                    {themes.map((theme, index) => (
                                        <option value={index} key={index} className="option-main">
                                            {theme.name.charAt(0).toUpperCase() + theme.name.slice(1).replace("Theme", "")}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <p style={{ color: "red" }}>{ error }</p>
                            <Button type="submit" className="my-1">Sign Up</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;