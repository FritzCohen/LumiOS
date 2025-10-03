(async () => {
    /* 
    * BUILT FOR LUMI OS
    * NOVEMBER 17th 2024
    */

    const fetchLink = "https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/Info.json";

    try {
        const response = await fetch(fetchLink);
        if (!response.ok) throw new Error('Failed to fetch Info.json');

        const fetched = await response.json();

        const version = fetched[0]?.version;
        if (!version) throw new Error('Version not found in Info.json');

        const downloadLink = `https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${version}.html`;

        const fileResponse = await fetch(downloadLink);
        if (!fileResponse.ok) throw new Error('Failed to fetch the versioned file');

        const content = await fileResponse.text();

        const popupWindow = window.open('', '_blank', 'width=800,height=600');
        if (!popupWindow) throw new Error("Popup window couldn't be opened. Please check your browser settings.");

        popupWindow.document.open();
        popupWindow.document.write(content);
        popupWindow.document.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();