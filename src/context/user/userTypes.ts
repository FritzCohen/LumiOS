/**
 * This file should manage anything user related
 * 
 * I moved themes and panic config into this file
*/

import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Permission } from "../../types/globals"
import { SystemProps } from "../window/types"

// -------------------------------------------------------------
// Panic settings
// -------------------------------------------------------------
export interface PanicConfig {
    key: string;
    website: string;
    title: string;
    favicon: string;
}

// -------------------------------------------------------------
// Browser configurations
// -------------------------------------------------------------
export interface BrowserLink {
    link: string
    title: string
}

export interface BrowserConfig {
    proxyLinks: BrowserLink[];
    defaultLink: BrowserLink;
    bookmarks: BrowserLink[];
}

// -------------------------------------------------------------
// Themes stuffs
// -------------------------------------------------------------
export interface ColorTheme {
  name: string
  colors: {
    background: string
    backgroundAlt: string
    surface: string
    surfaceAlt: string
    accent: string
    accentAlt: string
    danger: string
    success: string
  }
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  border: {
    default: string
    subtle: string
  }
}

export interface UIElementStyle {
  rounding: string;
  padding: string;
  iconSize: string;
  glassAlpha: number;
}

export interface UIStyleTheme extends UIElementStyle {
  spacing: string;
  globalGlassAlpha: number;
  taskbar: UIElementStyle & { mode: 'full' | 'floating'; align: 'start' | 'center' | 'end'; onHover: boolean };
  topbar: UIElementStyle & { visible: boolean; onHover: boolean };
  desktop: UIElementStyle & { orientation: 'row' | 'column' };
}

// -------------------------------------------------------------
// User profile
// -------------------------------------------------------------
export interface User {
  username: string;
  password: string;
  icon: IconDefinition | string;
  permission: Permission;
  autoLogin: boolean;

  colorTheme: ColorTheme;
  uiStyle: UIStyleTheme;
  backgroundImage: string;

  browserConfig: BrowserConfig;
  panic: PanicConfig;
  systemProps: SystemProps;
}