import { ReactNode } from "react"
import { MIMETypes } from "./MIMETypes"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

export enum Errors {
    ENOENT = 'ENOENT',
    EISDIR = 'EISDIR',
    EEXIST = 'EEXIST',
    EPERM = 'EPERM',
    ENOTDIR = 'ENOTDIR',
    EACCES = 'EACCES'
}

export enum Permission {
    USER,
    ELEVATED,
    SYSTEM
}

export interface Item {
    type: 'directory' | 'file'
    date: Date
    permission: Permission
    deleteable: boolean
}

export interface Directory extends Item {
    type: 'directory'
    children: {
      [key: string]: Directory | File
    }
}
  
export interface File extends Item {
    type: 'file'
    displayName?: string
    fileType: keyof typeof MIMETypes
    content: any
}

export interface Executable {
    config: {
        name: string
        version?: string
        description?: string
        [key: string]: any // Additional config options
    }
    mainComponent: () => ReactNode // Function that returns the React component
}

export interface ContextMenuItem {
    name: string
    icon?: any
    action: () => void
    isDropdown?: boolean
    gap?: boolean
    children?: ContextMenuItem[]
}

export interface Process {
    name: string
    //displayName?: string // what the fuck
    path?: string
    svg?: IconDefinition | string
    permission?: Permission
    id: number
    content?: any
    type: keyof typeof MIMETypes
    minimized: boolean
    maximized: boolean
}

export interface Theme {
    primary: string
    primaryLight: string
    secondary: string
    secondaryLight: string
    textBase: string
}

export interface App {
    name: string
    actualName: string
    description: string
    userInstalled: boolean
    svg: any
    fileContent?: string
    path: string
}

export interface User {
    username: string
    password: string
    svg: IconDefinition | string
    permission: Permission
    autoLogin: boolean
    theme: Theme
    backgroundImage: string
    panic: Panic
}

export interface SystemProps {
    taskbar: "full" | "floating"
    taskbarAlign: "start" | "center" | "end"
    firstLogin: boolean
    scrollbar: string
    showTopbar: boolean
    gamesLink: string
    version: number
    onHoverTaskbar: boolean
    onHoverTopbar: boolean
    runSecureBot: boolean
    enableWindowBackground: boolean
    windowStyle: string
    topbarStyle: string
    devMode: boolean
}

export interface Popup {
    name: string
    appName?: string
    id: number
    description: string
    minimized: boolean
    children?: ReactNode
    onAccept: () => Promise<void> | (() => void)
    onReject?: () => Promise<void> | (() => void)
}

export interface Game {
    name: string
    description: string
    image: string
    svg?: string
    path: string
    types: [string, string, string] | undefined
    type: "html" | "swf"
}

export interface StorageHandler {
    initialize(): Promise<void>;
    save(data: any): Promise<void>;
    load(): Promise<any | undefined>;
    reset(): Promise<boolean>;
}  

export interface Panic {
    key: string;
    website: string;
    title: string;
    favicon: string;
}

/**
 * Method for storing data in the filesystem
 * 
 * OPFS is a non-static storage system
 * 
 * indexedDB is good for having large amounts of data
 * 
 * NOTE: Sometimes it will not save with frequent loading
 * 
 * localStorage is good for cloud service
 * 
 * fileStorage only works with chrome and edge
 */
export type storageMethod = 'OPFS' | 'indexedDB' | 'localStorage' | 'fileStorage';