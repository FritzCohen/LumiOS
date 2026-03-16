/**
 * Default icon sizes for items
*/
export type IconSize = "16px" | "32px" | "48px" | "64px";

/**
 * Default padding sizes for items
*/
export type Rounding = "4px" | "8px" | "12px";

/**
 * Default rounding n'stuff
*/
export type Padding = "";

export interface SystemProps {
  appearance: {
    scrollbar: string;
    windowStyle: string;
    enableWindowBackground: boolean;
  };
  system: {
    firstLogin: boolean;
    runSecureBot: boolean;
    gamesLink: string;
    version: number;
    devMode: boolean;
  };
}