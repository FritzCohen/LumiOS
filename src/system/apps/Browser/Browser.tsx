import { ReactNode, useRef, useState } from "react";
import "./Browser.css";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faHome, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import logo from "../../../assets/no-bg-logo.png";

interface Tab {
    id: number;
    url: string;
    title: string;
    bookmark: boolean;
}

const Browser = () => {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: 0, url: "/home", title: "Home", bookmark: false }
    ]);
    const [activeTabId, setActiveTabId] = useState<number>(0);
    const [searchUrl, setSearchUrl] = useState<string>("");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const activeTab = tabs.find(tab => tab.id === activeTabId);

    const isExternalUrl = (url: string): boolean => {
        return /^(https?:|\/\/)/.test(url);
    };

    const getContent = (): ReactNode => {
        if (!activeTab) return null;

        if (activeTab.url === "/home") {
            return (
                <div className="w-full h-full flex flex-col items-center py-5">
                    <h3 className="font-bold text-2xl">Home</h3>
                    <p className="font-light">This is NOT a proxy. No sites will be unblocked.</p>
                    <p className="font-light">Your device may block iframes. You will not be able to use this.</p>
                    <p className="pt-5">Built in links:</p>
                    <ul>
                        <li>/home</li>
                        <li>/force</li>
                    </ul>
                </div>
            );
        }

        if (activeTab.url === "/force") {
            return <iframe ref={iframeRef} src={'/'} title={activeTab.title} id="content" />;
        }

        // If you go here please stop
        if (activeTab.url === "/proxy" || activeTab.url === "/settings") return <div>This no longer exists.</div>

        // Secret link/path the user can find cause im like that
        if (activeTab.url === "/secret") {
            return <div className="w-full h-full flex flex-col items-center py-5">
                hey you found it! <br/>
                click the link below to access a form to fill out!

                <Button style={{ color: "pink" }} onClick={() => {
                    setSearchUrl("https://forms.gle/FreSQcN1RGr265gf8");
                    const title = searchUrl.replace("https://", "").replace("http://", "").split(".")[0];
        
                    if (activeTab) {
                        const updatedTabs = tabs.map(tab =>
                            tab.id === activeTabId ? { ...tab, url: searchUrl, title: title } : tab
                        );
                        setTabs(updatedTabs);
                    }
                }}>Click here.</Button>
            </div>
        }

        if (isExternalUrl(activeTab.url)) {
            return <iframe ref={iframeRef} src={activeTab.url} title={activeTab.title} id="content" />;
        }

        return <div>Invalid URL or local content cannot be displayed in an iframe.</div>;
    };

    const handleTabClick = (id: number) => {
        setActiveTabId(id);
        const tab = tabs.find(tab => tab.id === id);
        
        if (tab) searchRef.current!.value = tab.url;
    };

    const handleTabClose = (id: number) => {
        const remainingTabs = tabs.filter(tab => tab.id !== id);
        setTabs(remainingTabs);
        if (activeTabId === id && remainingTabs.length > 0) {
            setActiveTabId(remainingTabs[0].id);
        }
    };

    const addNewTab = (url: string) => {
        const newTab: Tab = {
            id: tabs.length,
            url,
            title: `Tab ${tabs.length + 1}`,
            bookmark: false,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const title = searchUrl.replace("https://", "").replace("http://", "").split(".")[0];
        
        if (activeTab) {
            const updatedTabs = tabs.map(tab =>
                tab.id === activeTabId ? { ...tab, url: searchUrl, title: title } : tab
            );
            setTabs(updatedTabs);
        }
    };

    const handleRefresh = () => {
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = currentSrc;  // Reset the iframe src to refresh it
        }
    };

    const handleHome = () => {
        setTabs(prev => prev.map(tab => 
            tab.id === activeTabId ? { ...tab, url: "/home" } : tab
        ));
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* Tabs */}
            <div className="flex space-x-2 pt-1 px-1 gap-1">
                <img src={logo} className="w-8 h-8 m-1" alt="Check out /Documents" />
                {tabs.map(tab => (
                    <div key={tab.id} className={`tab ${tab.id === activeTabId ? 'active' : ''}`}>
                        <span className="cursor-pointer" onClick={() => handleTabClick(tab.id)}>
                            {tab.title}
                        </span>
                        <button className="close-button" onClick={() => handleTabClose(tab.id)}><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                ))}
                <button onClick={() => addNewTab("/home")} className="tab !p-2"><FontAwesomeIcon icon={faPlus} /></button>
            </div>
            {/* Search Bar */}
            <div className="browser-bar">
                <Button onClick={handleHome} className="browser-item" style={{ background: "none"}}><FontAwesomeIcon icon={faHome} /></Button>
                <Button onClick={handleRefresh} className="browser-item" style={{ background: "none"}}><FontAwesomeIcon icon={faRefresh} /></Button>
                <form onSubmit={handleSearchSubmit} className="flex flex-grow space-x-2" >
                    <div className={`relative w-full`}>
                        <input
                            type="text"
                            defaultValue="/home"
                            ref={searchRef}
                            onChange={(e) => setSearchUrl(e.target.value)}
                            className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                            placeholder="Search Apps..."
                            style={{ background: "none"}}
                        />
                    </div>
                    <Button className="browser-item" style={{ background: "none"}}>Go</Button>
                </form>
            </div>
            {/* Content Area */}
            <div className="flex-grow">
                {getContent()}
            </div>
        </div>
    );
};

export default Browser;