import bg1 from "../assets/background/image1.jpeg";
import bg2 from "../assets/background/image2.jpg";
import bg3 from "../assets/background/image3.jpg";
import bg4 from "../assets/background/bg1.avif";
import bg9 from "../assets/background/image9.jpg";
import bg10 from "../assets/background/image10.jpg"
import folderIcon from "../assets/Icons/Settings/folder.png";
import generic from "../assets/Icons/Settings/generic.ico";
import config from "../assets/Icons/Settings/configuration.ico";
import txtIcon from "../assets/Icons/Settings/text.ico";
import scriptIcon from "../assets/Icons/Settings/script.png";
import exeIcon from "../assets/Icons/Settings/executable.ico";

export const images: string[] = [
    bg1,
    bg2,
    bg3,
    bg4,
    bg9,
    bg10,
];

// Never ever use this. Idk why this file exists to begin with
// Maybe because I saw someone use a file named this once
// And thought it was a good idea
// Its not. Don't do it.

// This is me from the future
// I am talking about Process.ts
// Don't use it for processes
// i guess
export const appNames: string[] = [
    "Settings",
    "AppStore",
    "GetStarted",
    "Browser",
    "FileExplorer",
    "Discord",
    "AppCreator",
    "Terminal",
    "Webtools",
    "InstalledApps",
    "Code",
    "ControlPanel",
];

export const getIcon = (type: string): string => {    
    if (type === "directory") return folderIcon;
    if (type === "sys") return config;
    if (type === "txt") return txtIcon;
    if (type === "app") return exeIcon;
    if (type === "js" || type === "theme") return scriptIcon;

    return generic;
};

export function extractAndAttachAssets(htmlString: string) {
    // Create a temporary DOM element to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
  
    // Extract and append all <script> tags to the body
    const scripts = tempDiv.getElementsByTagName('script');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      newScript.src = script.src || '';  // If the script has a src, copy it
      newScript.innerHTML = script.innerHTML; // Copy the inner content
      newScript.type = script.type || 'text/javascript'; // Set the script type if provided
      document.body.appendChild(newScript);
    }
  
    // Extract and append all <style> tags to the head
    const styles = tempDiv.getElementsByTagName('style');
    for (const style of styles) {
      const newStyle = document.createElement('style');
      newStyle.innerHTML = style.innerHTML;  // Copy the CSS content
      document.head.appendChild(newStyle);
    }
  
    // Return the cleaned-up HTML without the <script> and <style> tags
    // You can use this cleaned-up HTML for rendering content
    const cleanedHtml = tempDiv.innerHTML;
    return cleanedHtml;
}

export function generateXYGrid(items: string[]): { [key: string]: { x: number, y: number } } {
  const grid: { [key: string]: { x: number, y: number } } = {};
  const itemHeight = 90; // Adjust based on CSS height + margin
  const itemWidth = 80;  // Adjust based on CSS width + margin
  const windowHeight = window.innerHeight;

  // Calculate how many rows can fit based on window height
  const rows = Math.floor(windowHeight / itemHeight);

  items.forEach((item, index) => {
    // Calculate which column the item should be in
    const column = Math.floor(index / rows);
    // Calculate the y position based on the item in the column
    const y = (index % rows) * itemHeight;
    // Calculate the x position based on the column
    const x = column * itemWidth;

    grid[item] = { x, y };
  });

  return grid;
}