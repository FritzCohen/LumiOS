import { Panic, Theme as theme, User } from "./types";

interface ThemeInterface {
    setTheme: (theme: theme, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) => Promise<void>;
    setBackground: (image: string, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) => Promise<void>;
    setTaskbar: (type: 'full' | 'floating') => void;
    setPanic: (panic: Panic) => void;
}

/**
 * Theme
 * 
 * Works with the theme of the OS, setting colors, background images, and taskbar styles.
 * 
 * I had to rename some the variables to avoid conflicts with the global Theme interface.
 */
export const Theme: ThemeInterface = new (class them {    /**
     * setTheme
     * 
     * @param theme - Theme interface containing style properties
     * @param update - Boolean indicating whether to update the theme for the user
     * @param currentUser - The current user object or null if not logged in
     * @param modifyUserProp - Function to modify a user's properties
     * 
     * modifyUserProp Parameters:
     *   - @param prop - Partial user object representing properties to modify
     *   - @param id - Username or index to identify which user to modify
    */
    public async setTheme(theme: theme, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) {
        if (update && currentUser && modifyUserProp) {
            /*
            await virtualFS.deleteFile("System/", "Theme");
            await virtualFS.writeFile("System/", "Theme", theme, "sys");
            */

            await modifyUserProp({ theme: theme }, currentUser.username);
        }

        const root = document.documentElement;
        Object.keys(theme).forEach((cssVar) => {
            const key = cssVar as keyof theme;
            root.style.setProperty(`--${cssVar}`, theme[key]);
        });
    }    

    /**
     * setBackground
     * 
     * @param image URL of background, can be data://
     * @param update boolean indicating whether to update
     * @param currentUser current user context passed as a parameter
     *
     * modifyUserProp Parameters:
     *   - @param prop - Partial user object representing properties to modify
     *   - @param id - Username or index to identify which user to modify
     */
    public async setBackground(image: string, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) {
        if (update && currentUser && modifyUserProp) {
            /*
            await virtualFS.deleteFile("System/", "BackgroundImage");
            await virtualFS.writeFile("System/", "BackgroundImage", image, "sys");
            */

            await modifyUserProp({ ...currentUser, backgroundImage: image }, currentUser.username);
        }

        const root = document.documentElement;
        root.style.setProperty('--background-image', `url(${image})`);
    }

    /**
     * setTaskbar
     * 
     * Taskbar updates automatically, no need to update.
     * 
     * @param type full | floating
     */
    public setTaskbar(type: 'full' | 'floating') {
        const root = document.documentElement;
        root.style.setProperty('--taskbar', type);
    }

    /**
     * setPanic
     * 
     * Updates the page to current panic settings
     * 
     * @param panic User panic interface
     */

    public setPanic(panic: Panic) {
        if (!panic) return;

        window.document.title = panic.title;

        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        
        if (link) {
            link.href = panic.favicon;
        }        
    }
})();

export default Theme;