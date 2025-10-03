import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Executable, PanicConfig, Permission, Theme } from "../../types/globals"
import { SystemProps } from "../window/types"

export interface BrowserLink {
    link: string
    title: string
}

export interface BrowserConfig {
    proxyLinks: BrowserLink[];
    defaultLink: BrowserLink;
    bookmarks: BrowserLink[];
}

export interface User {
    username: string
    password: string
    icon: IconDefinition | string
    permission: Permission
    autoLogin: boolean
    theme: UserTheme
    backgroundImage: string
    browserConfig: BrowserConfig
    panic: PanicConfig
    installedApps: Executable[]
    systemProps: SystemProps
}

/**
 * NOT REALLY USED
 * 
 * Used as a loop in user themes, sets a CSS variable property, 
 * so that OS can be customized
 */
export interface LoopedProperty {
    name?: string
    property: string
    value: string
}

/**
 * User theme config interface
 * 
 * Each property is used to customize a part of the OS
 */
export interface UserTheme {
    window: Theme
    topbar: LoopedProperty[]
    taskbar: LoopedProperty[]
}