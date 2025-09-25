<div align="center">

# Lumi OS

### 🚀 Join the Community  
[![Discord](https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/images/discord.png)](https://discord.gg/TyacaNY3GK)

**Lumi OS** is a modern **React + TypeScript** operating system built for the browser.  
It offers a dynamic desktop experience with offline functionality, themes, plugins, games, and more!

</div>

---

## 🧰 Features

- 🎨 **Themes**, **plugins**, and much more  
- 🎮 Over **200+ games** built-in  
- 🔄 **Constant updates**  
- 📁 Fully-functional **file system**  
- 📝 Built-in **text editor**

---

## Downloading

Lumi OS can be run locally, so click on this [link](https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/old/LumiOS.v12.5.html) in order to download the file. It can also be downloaded as an about:blank page.
- Can I run Lumi OS off of my chromebook?
	> Yes, Lumi OS can be run from local files.
- How do I know when to update my file?
	> There will be a popup notifying the user of an update.
- Why won't my changes be saved?
	> Selecting any other file besides the one opened will break it.

### Bookmarklet

Paste the following code into your bookmark bar and click it to run Lumi OS on any website.
```
javascript:(function(){(async () => {/** BUILT FOR LUMI OS NOVEMBER 17th 2024*/const fetchLink = "https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/Info.json";try {const response = await fetch(fetchLink);if (!response.ok) throw new Error('Failed to fetch Info.json');const fetched = await response.json();const version = fetched[0]?.version;if (!version) throw new Error('Version not found in Info.json');const downloadLink = https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${version}.html;const fileResponse = await fetch(downloadLink);if (!fileResponse.ok) throw new Error('Failed to fetch the versioned file');const content = await fileResponse.text();const popupWindow = window.open('', '_blank', 'width=800,height=600');if (!popupWindow) throw new Error("Popup window couldn't be opened. Please check your browser settings.");popupWindow.document.open();popupWindow.document.write(content);popupWindow.document.close();} catch (error) {console.error('Error:', error.message);}})();})()
```
---

## 🤝 Contributing

Lumi OS os now **open-source**!  
Games have moved to a separate repository: [lumi-games](https://github.com/LuminesenceProject/lumi-games)

> 📝 When adding games, please ensure you include an **image preview**.

To get the source code, click the dropdown on main, then the version you want.
Unfortunately old versions were lost since the code was directly updated.
The code between major updates was completely changed. 

> [!NOTE]  
> Some feature suggestions may not be added — especially ones relying on external servers — to keep **offline functionality** intact.  
> Game links can always be updated through the **Settings** app.

👑 **Contributors** will be credited in this repository.

---

## Issues & Support

To report an issue, visit the [GitHub Issues page](https://github.com/LuminesenceProject/LumiOS/issues) and click **New Issue**.  
You can also chat with us and submit bugs on our [Discord server](https://discord.gg/TyacaNY3GK)!

### ⚠️ Common Issues & Fixes

- **White Screen Error:**  
  This is a known issue. To fix it, type `"lumiplus"` (exact spelling) — this will **clear all local data** and reset the system.  
  Works on version 4.2 and above, *except for v11*, where you must redownload the latest version.

> [!IMPORTANT]  
> Type `"lumiplus"` in that exact order to trigger the system reset popup.

📸 If possible, provide a screenshot or copy the error message when reporting.

---

## Todo

- [x] Release source code
- [ ] Release v12+ source code
- [x] Add more games
- [x] Fix update bugs
- [x] Create more websites
- [ ] Add more TODOs

## Terms of Use

By downloading or using this code, you agree to the terms, conditions, and license specified in the **MAIN** branch.

### Modification and Redistribution  
If this code is modified and redistributed, the following conditions must be met:  
- All modifications must be clearly disclosed to the user on the loading screen.  
- A direct link to the modified source code must be provided.
- A direct link to [LumiOS](https://github.com/LuminesenceProject/LumiOS) must also be provided.
- You agree to all future versions of the terms.
