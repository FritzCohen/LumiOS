import { useEffect } from "react";
import { useUser } from "../../context/user/user";
import { useWindow } from "../../context/window/WindowProvider";
import { useKernel } from "../../hooks/useKernal";
import virtualFS from "./virtualFS";

/**
 * Official API for the OS
 * 
 * See {@link kernal} for opening apps and states
 * 
 * See {@link user} for user states
 * 
 * See {@link win} for window options and configs
 * 
 * See {@link virtualFS} for the file system
 * 
 * @returns null
 */
export default function API() {
    const kernal = useKernel();
    const user = useUser();
    const win = useWindow();

    useEffect(() => {
        (window as any).API = {
            kernal,
            user,
            win,
            virtualFS,
        };
    }, [kernal, user, win]);

    return null; // This component doesn't render anything
}