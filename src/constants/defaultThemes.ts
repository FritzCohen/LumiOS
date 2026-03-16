import { ColorTheme } from "../context/user/userTypes";

const defaultThemes: ColorTheme[] = [
  {
    name: "Blue",
    
    colors: {
      background: "#141C28",
      backgroundAlt: "#192434",

      surface: "#1E283C",
      surfaceAlt: "#283750",

      accent: "#2e79ba",
      accentAlt: "#5fc9f3",

      danger: "#DC4646",
      success: "#32C878",
    },

    text: {
      primary: "white",
      secondary: "#CCCCCC",
      disabled: "#777777",
    },

    border: {
      default: "#3A3A3A",
      subtle: "#2A2A2A",
    },
  },

  {
    name: "Light Blue",
    
    colors: {
      background: "#1E283C",
      backgroundAlt: "#283C5A",

      surface: "#324664",
      surfaceAlt: "#3C506E",

      accent: "#5fc9f3",
      accentAlt: "#8ad4ff",

      danger: "#DC4646",
      success: "#32C878",
    },

    text: {
      primary: "white",
      secondary: "#CFCFCF",
      disabled: "#7A7A7A",
    },

    border: {
      default: "#3A3A3A",
      subtle: "#2A2A2A",
    },
  },

  {
    name: "Pink",
    
    colors: {
      background: "#46101E",
      backgroundAlt: "#5A192D",

      surface: "#782846",
      surfaceAlt: "#96405A",

      accent: "#f48fb1",
      accentAlt: "#f9a3c2",

      danger: "#FF5A6E",
      success: "#46C882",
    },

    text: {
      primary: "white",
      secondary: "#E6D6DA",
      disabled: "#8B7A7D",
    },

    border: {
      default: "#4A4A4A",
      subtle: "#2A2A2A",
    },
  },

  {
    name: "Purple",
    
    colors: {
      background: "#281E3C",
      backgroundAlt: "#372850",

      surface: "#463273",
      surfaceAlt: "#5A4690",

      accent: "#927fbf",
      accentAlt: "#c4bbf0",

      danger: "#E14B6E",
      success: "#46C878",
    },

    text: {
      primary: "white",
      secondary: "#DDD6F0",
      disabled: "#827A99",
    },

    border: {
      default: "#3A3A3A",
      subtle: "#2A2A2A",
    },
  },

  {
    name: "White",
    
    colors: {
      background: "#FFFFFF",
      backgroundAlt: "#F5F5F5",

      surface: "#FFFFFF",
      surfaceAlt: "#EDEDED",

      accent: "#495464",
      accentAlt: "#BBBFCA",

      danger: "#C83232",
      success: "#32B464",
    },

    text: {
      primary: "#1a1a1a",
      secondary: "#444444",
      disabled: "#777777",
    },

    border: {
      default: "#CFCFCF",
      subtle: "#DDDDDD",
    },
  },

  {
    name: "Black",
    
    colors: {
      background: "#0A0A0A",
      backgroundAlt: "#0F0F0F",

      surface: "#191919",
      surfaceAlt: "#222222",

      accent: "#343A40",
      accentAlt: "#737f8c",

      danger: "#D23C3C",
      success: "#32B46E",
    },

    text: {
      primary: "white",
      secondary: "#CFCFCF",
      disabled: "#777777",
    },

    border: {
      default: "#2A2A2A",
      subtle: "#1A1A1A",
    },
  },

  {
    name: "Green",
    
    colors: {
      background: "#0F1914",
      backgroundAlt: "#14231C",

      surface: "#192820",
      surfaceAlt: "#1E3226",

      accent: "#00ad7c",
      accentAlt: "#52d681",

      danger: "#DC5050",
      success: "#28C882",
    },

    text: {
      primary: "white",
      secondary: "#D6F0E4",
      disabled: "#82A497",
    },

    border: {
      default: "#3A3A3A",
      subtle: "#2A2A2A",
    },
  },
  {
    name: "Amber Void",

    colors: {
      background: "#16120E",
      backgroundAlt: "#1F1913",

      surface: "#2A2119",
      surfaceAlt: "#3A2C21",

      accent: "#FFB020",
      accentAlt: "#FFD37A",

      danger: "#E25555",
      success: "#4ECB71",
    },

    text: {
      primary: "#FFF6E8",
      secondary: "#E0D2BD",
      disabled: "#8C7B68",
    },

    border: {
      default: "#3A3026",
      subtle: "#241D16",
    },
  },
  {
    name: "Crimson Night",

    colors: {
      background: "#14090B",
      backgroundAlt: "#1C0E12",

      surface: "#2A141A",
      surfaceAlt: "#3A1D26",

      accent: "#C92A4A",
      accentAlt: "#FF6B81",

      danger: "#FF4D4D",
      success: "#3AD29F",
    },

    text: {
      primary: "#FFF0F3",
      secondary: "#E6C7CD",
      disabled: "#8A6A72",
    },

    border: {
      default: "#3A1F26",
      subtle: "#241116",
    },
  },
  { // Dunno why this is the name...
    name: "Neon District",

    colors: {
      background: "#06060A",
      backgroundAlt: "#0B0B14",

      surface: "#101028",
      surfaceAlt: "#17173A",

      accent: "#FF00FF",      // magenta neon
      accentAlt: "#00F6FF",   // cyan neon

      danger: "#FF2A4D",
      success: "#00FF9C",
    },

    text: {
      primary: "#EFFFFF",     // harsh LED-white
      secondary: "#7DF9FF",   // cyan glow text
      disabled: "#5A5A7A",
    },

    border: {
      default: "#2F2F6A",
      subtle: "#14142E",
    },
  }

];

export default defaultThemes;