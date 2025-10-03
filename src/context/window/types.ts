export interface SystemProps {
  taskbar: {
    mode: 'full' | 'floating';
    align: 'start' | 'center' | 'end';
    onHover: boolean;
  };
  topbar: {
    visible: boolean;
    onHover: boolean;
    style: string;
  };
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