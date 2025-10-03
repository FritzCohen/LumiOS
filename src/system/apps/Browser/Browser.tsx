import { useEffect, useState } from "react";
import { Tab } from "./types";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCirclePlus,
	faX,
	faArrowLeft,
	faArrowRight,
	faRotateRight,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../lib/Input";
import "./browser.css";
import { useUser } from "../../../context/user/user";
import { BrowserLink } from "../../../context/user/types";

const Browser: React.FC<{ defaultLink?: string }> = ({ defaultLink: dfl }) => {
	const { currentUser, modifyUserProp } = useUser();

	const defaultLink = dfl
		? { link: dfl, title: "Home" } // prop always wins
		: currentUser?.browserConfig?.defaultLink ?? { link: "/home", title: "Home" };

    const [tabs, setTabs] = useState<Tab[]>([
        {
            id: 0,
            url: defaultLink.link,
            title: defaultLink.title,
        },
    ]);
	const [selectedTabId, setSelectedTabId] = useState<number>(0);
	const [nextId, setNextId] = useState<number>(1);

    const [histories, setHistories] = useState<Record<number, string[]>>({
        0: [defaultLink.link],
    });
	const [historyIndex, setHistoryIndex] = useState<Record<number, number>>({
		0: 0,
	});

	const selectedTab = tabs.find((t) => t.id === selectedTabId);
	const currentHistory = histories[selectedTabId] || [];
	const currentIndex = historyIndex[selectedTabId] ?? 0;

    const [addressBar, setAddressBar] = useState<string>(defaultLink.link);
    const [bookmarkBar, setBookmarkBar] = useState<BrowserLink[]>(
        currentUser?.browserConfig?.bookmarks || []
    );

	// Sync address bar when tab changes
	useEffect(() => {
		const tab = tabs.find((t) => t.id === selectedTabId);
		setAddressBar(tab?.url || "");
	}, [selectedTabId, tabs]);

	const updateTabUrl = (id: number, url: string, pushHistory = false) => {
		setTabs((prev) =>
			prev.map((tab) =>
				tab.id === id ? { ...tab, url, title: url } : tab
			)
		);

		if (pushHistory) {
			setHistories((prev) => {
				const current = prev[id] || [];
				const idx = historyIndex[id] ?? current.length - 1;
				const newHist = [...current.slice(0, idx + 1), url];
				return { ...prev, [id]: newHist };
			});

			setHistoryIndex((prev) => ({
				...prev,
				[id]: (prev[id] ?? 0) + 1,
			}));
		}
	};

    const addTab = () => {
        const id = nextId;
        const link = currentUser?.browserConfig?.defaultLink || {
            link: "/home",
            title: "Home",
        };

        setTabs((prev) => [
            ...prev,
            { id, url: link.link, title: link.title, bookmarked: false },
        ]);
        setHistories((prev) => ({ ...prev, [id]: [link.link] }));
        setHistoryIndex((prev) => ({ ...prev, [id]: 0 }));
        setSelectedTabId(id);
        setNextId(id + 1);
        setAddressBar(link.link);
    };

	const closeTab = (tab: Tab) => {
		setTabs((prev) => prev.filter((t) => t.id !== tab.id));
		if (selectedTabId === tab.id && tabs.length > 1) {
			const remaining = tabs.filter((t) => t.id !== tab.id);
			setSelectedTabId(remaining[0].id);
		}
	};

	const goBack = () => {
		const idx = currentIndex;
		if (idx > 0) {
			const newIdx = idx - 1;
			const newUrl = currentHistory[newIdx];

			setHistoryIndex((prev) => ({
				...prev,
				[selectedTabId]: newIdx,
			}));
			setTabs((prev) =>
				prev.map((tab) =>
					tab.id === selectedTabId
						? { ...tab, url: newUrl, title: newUrl }
						: tab
				)
			);
		}
	};

	const goForward = () => {
		const idx = currentIndex;
		if (idx < currentHistory.length - 1) {
			const newIdx = idx + 1;
			const newUrl = currentHistory[newIdx];

			setHistoryIndex((prev) => ({
				...prev,
				[selectedTabId]: newIdx,
			}));
			setTabs((prev) =>
				prev.map((tab) =>
					tab.id === selectedTabId
						? { ...tab, url: newUrl, title: newUrl }
						: tab
				)
			);
		}
	};

	const refresh = () => {
		const current = currentHistory[currentIndex] || "/home";
		setTabs((prev) =>
			prev.map((tab) =>
				tab.id === selectedTabId
					? { ...tab, url: current, title: current }
					: tab
			)
		);
	};

	const isExternalUrl = (url: string): boolean => {
		return /^(https?:|\/\/)/.test(url);
	};

	const isInternalUrl = (url: string): boolean => {
		return ["/home", "/settings", "/proxy"].includes(url);
	};

    const toggleBookmark = (tab: Tab | undefined) => {
        if (!currentUser || !tab) return;

        const currentBookmarks = bookmarkBar;
        const exists = currentBookmarks.some((b) => b.link === tab.url);

        const newBookmarks = exists
            ? currentBookmarks.filter((b) => b.link !== tab.url)
            : [...currentBookmarks, { link: tab.url, title: tab.title }];

        setBookmarkBar(newBookmarks);

        modifyUserProp(currentUser.username, "browserConfig", {
            ...currentUser.browserConfig,
            bookmarks: newBookmarks,
        });
    };

	const getTabContent = () => {
		if (!selectedTab)
			return (
				<div className="p-4">
					Select or add a tab to continue browsing.
				</div>
			);

		// Check for non-registered internal URLs
		if (
			!isInternalUrl(selectedTab.url) &&
			!isExternalUrl(selectedTab.url)
		) {
			return (
				<p className="p-4 text-red-300">
					Invalid or unsupported internal URL.
				</p>
			);
		}

		switch (selectedTab.url) {
			case "/home":
				return <div className="w-full h-full flex flex-col items-center py-5">
                <h3 className="font-bold text-2xl">Home</h3>
                <p className="font-light">This is NOT a proxy. No sites will be unblocked.</p>
                <p className="font-light">Your device may block iframes. You will not be able to use this.</p>
                <p className="pt-5">Built in links:</p>
                <ul>
                    <li>/home</li>
                    <li>/force</li>
                </ul>
            </div>
			case "/settings":
			case "/proxy":
				return <div className="p-4">Nothing here...</div>;
			default:
				return (
					<iframe
						src={selectedTab.url}
						className="w-full h-full border-none"
						title="Web View"
					/>
				);
		}
	};

	return (
		<div className="flex flex-col w-full h-full">
			{/* Tabs */}
			<div className="flex items-end gap-1 px-2 pb-[1px]">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={`tab ${
							selectedTabId === tab.id ? "active" : ""
						}`}
						onClick={() => setSelectedTabId(tab.id)}
					>
						<span className="text-white text-sm">{tab.title}</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								closeTab(tab);
							}}
						>
							<FontAwesomeIcon
								icon={faX}
								className="text-white text-xs"
							/>
						</button>
					</div>
				))}
				<Button onClick={addTab}>
					<FontAwesomeIcon icon={faCirclePlus} />
				</Button>
			</div>
            {/* Bookmarks bar */}
            {bookmarkBar.length > 0 && (
                <div className="browser-bar gap-2 overflow-x-auto !mb-0 pt-1">
                    {bookmarkBar.map((bookmark, idx) => (
                        <Button
                            key={idx}
                            onClick={() => {
                                if (selectedTab)
                                    updateTabUrl(selectedTab.id, bookmark.link, true);
                            }}
                            className="text-sm px-3"
                        >
                            {bookmark.title}
                        </Button>
                    ))}
                </div>
            )}
			{/* Navigation Bar */}
			<div className="browser-bar">
				<Button onClick={goBack} disabled={currentIndex <= 0}>
					<FontAwesomeIcon icon={faArrowLeft} />
				</Button>
				<Button
					onClick={goForward}
					disabled={currentIndex >= currentHistory.length - 1}
				>
					<FontAwesomeIcon icon={faArrowRight} />
				</Button>
				<Button onClick={refresh}>
					<FontAwesomeIcon icon={faRotateRight} />
				</Button>
				<Input
					className="flex-1"
					value={addressBar}
					onChange={(e) => setAddressBar(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && selectedTab) {
							updateTabUrl(selectedTab.id, addressBar, true);
						}
					}}
					onBlur={() => {
						if (selectedTab)
							updateTabUrl(selectedTab.id, addressBar, true);
					}}
					placeholder="Enter URL..."
				/>
                <Button onClick={() => toggleBookmark(selectedTab)} className="px-2 !pr-3">
                    <FontAwesomeIcon icon={faStar} />
                </Button>
			</div>

			{/* Main Content */}
			<div className="flex-1 bg-white overflow-hidden">
				{getTabContent()}
			</div>
		</div>
	);
};

export default Browser;
