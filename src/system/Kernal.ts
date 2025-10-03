// I was going to make the Kernal data stored in here
// And have everything update by a dependency array without using useEffect
// But then I remembered that providers exist and classes suck

import { Process } from "../utils/types"

interface Popup {
    name: string
    id: number
    description: string
    onAccept: () => Promise<void>
}

export default class Kernal {
    private static openedApps: Process[] = [{
        name: 'test',
        id: 0,
        minimized: false,
        maximized: false,
    }];
    private static popups: Popup[] = [];
    private static nextId: number = 1; // Initialize ID counter
    private static loggedIn: boolean = true;
    private static forceUpdateCallbacks: (() => void)[] = [];

    public static registerForceUpdateCallback(callback: () => void): () => void {
        this.forceUpdateCallbacks.push(callback);

        // Return an unregister function
        return () => {
            this.forceUpdateCallbacks = this.forceUpdateCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Unregister a callback for force updates.
    */
    public static unregisterForceUpdateCallback(callback: () => void): void {
        this.forceUpdateCallbacks = this.forceUpdateCallbacks.filter(cb => cb !== callback);
    }

    private static triggerForceUpdate(): void {
        this.forceUpdateCallbacks.forEach(callback => callback());
    }

    /**
     * Get all opened apps.
     * @returns Process[]
     */
    public static getOpenedApps(): Process[] {
        return this.openedApps;
    }

    /**
     * Get all popups.
     * @returns Popup[]
     */
    public static getPopups(): Popup[] {
        return this.popups;
    }

    /**
     * Add a new opened app with auto-assigned ID.
     * @param process The process to add.
     */
    public static addOpenedApp(process: Omit<Process, 'id'>): void {
        const newProcess = { ...process, id: this.nextId++ };
        this.openedApps.push(newProcess);

        this.triggerForceUpdate();
    }

    /**
     * Remove an opened app by its id or name.
     * @param id The id or name of the process to remove.
     */
    public static removeOpenedApp(id: string | number): void {
        this.openedApps = this.openedApps.filter((process: Process) =>
            typeof id === "number" ? process.id !== id : process.name !== id
        );

        this.triggerForceUpdate();
    }

    /**
     * Modify a property of an opened app.
     * @param id The id or name of the process to modify.
     * @param prop The property to modify and its new value.
     */
    public static modifyProp(id: string | number, prop: Partial<Process>): void {
        this.triggerForceUpdate();

        this.openedApps = this.openedApps.map((process: Process) => {
            if (typeof id === "number" ? process.id === id : process.name === id) {
                return { ...process, ...prop };
            }
            return process;
        });

        console.log(this.openedApps);
        
        this.triggerForceUpdate();
    }

    /**
     * Add a new popup with auto-assigned ID.
     * @param popup The popup to add.
     */
    public static addPopup(popup: Omit<Popup, 'id'>): void {
        const newPopup = { ...popup, id: this.nextId++ };
        this.popups.push(newPopup);

        this.triggerForceUpdate();
    }

    /**
     * Remove a popup by its id or name.
     * @param id The id or name of the popup to remove.
     */
    public static removePopup(id: string | number): void {
        this.popups = this.popups.filter((popup: Popup) =>
            typeof id === "number" ? popup.id !== id : popup.name !== id
        );
    }

    /**
     * Modify a property of a popup.
     * @param id The id or name of the popup to modify.
     * @param prop The property to modify and its new value.
     */
    public static modifyPopupProp(id: string | number, prop: Partial<Popup>): void {
        this.popups = this.popups.map((popup: Popup) => {
            if (typeof id === "number" ? popup.id === id : popup.name === id) {
                return { ...popup, ...prop };
            }
            return popup;
        });
    }

    /**
     * setLoggedIn
     * 
     * @param enabled Boolean value of logged in or not.
     */
    public static setLoggedIn(enabled: boolean) {
        this.loggedIn = enabled;
    }

    /**
     * getLoggedIn
     * 
     * @returns Boolean logged in.
     */
    public static getLoggedIn(): boolean {
        return this.loggedIn;
    }
}