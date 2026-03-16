import { ColorTheme } from "../context/user/userTypes";

const defaultTheme: ColorTheme = {
  name: "Default",
  colors: {
    background: "#0f0f0f",
    backgroundAlt: "#1a1a1a",

    surface: "#1e1e1e",
    surfaceAlt: "#252525",

    accent: "#4b6bff",
    accentAlt: "#8094ff",

    danger: "#d9534f",
    success: "#3dbb6e",
  },

  text: {
    primary: "#ffffff",
    secondary: "#c7c7c7",
    disabled: "#7a7a7a",
  },

  border: {
    default: "#333333",
    subtle: "#444444",
  },
}

export default defaultTheme;