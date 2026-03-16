import { useEffect, useMemo, useState } from "react";
import { Tab } from "./types";
import { useUser } from "../../../context/user/user";
import { BrowserLink } from "../../../context/user/userTypes";

interface UseBrowserOptions {
	defaultLink?: string;
	proxyEnabled?: boolean;
	proxyPrefix?: string; // e.g. "/proxy?url="
}

export const useBrowser = ({
	defaultLink: dfl,
	proxyEnabled = true,
	proxyPrefix = "/proxy?url=",
}: UseBrowserOptions) => {
	const { currentUser, modifyUserProp } = useUser();

	const defaultLink = dfl
		? { link: dfl, title: "Home" }
		: (currentUser?.browserConfig?.defaultLink ?? {
				link: "/home",
				title: "Home",
			});

	/* --------------------------
     URL HELPERS
  -------------------------- */

	const isExternalUrl = (url: string) => /^(https?:\/\/|\/\/)/.test(url);

	const isInternalUrl = (url: string) =>
		["/home", "/settings", "/proxy", "/force", "/secret"].includes(url);

	const normalizeUrl = (url: string) => {
		if (isInternalUrl(url)) return url;

		if (!/^https?:\/\//i.test(url)) {
			return `https://${url}`;
		}

		return url;
	};

	const resolveUrl = (rawUrl: string) => {
		if (!proxyEnabled) return rawUrl;

		if (!/^https?:\/\//i.test(rawUrl)) {
			rawUrl = `https://${rawUrl}`;
		}

		return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawUrl)}`;
	};

	const extractTitle = (url: string) => {
		if (isInternalUrl(url)) return url.replace("/", "") || "Home";

		try {
			const parsed = new URL(url);
			return parsed.hostname;
		} catch {
			return url;
		}
	};

	/* --------------------------
     STATE
  -------------------------- */
	const [tabs, setTabs] = useState<Tab[]>([
		{
			id: 0,
			rawUrl: defaultLink.link,
			resolvedUrl: resolveUrl(defaultLink.link),
			title: extractTitle(defaultLink.link),
		},
	]);

	const [selectedTabId, setSelectedTabId] = useState(0);
	const [nextId, setNextId] = useState(1);

	const [histories, setHistories] = useState<Record<number, string[]>>({
		0: [defaultLink.link],
	});

	const [historyIndex, setHistoryIndex] = useState<Record<number, number>>({
		0: 0,
	});

	const [addressBar, setAddressBar] = useState(defaultLink.link);

	const [bookmarkBar, setBookmarkBar] = useState<BrowserLink[]>(
		currentUser?.browserConfig?.bookmarks || [],
	);

	/* --------------------------
     DERIVED
  -------------------------- */

	const selectedTab = useMemo(
		() => tabs.find((t) => t.id === selectedTabId),
		[tabs, selectedTabId],
	);

	const currentHistory = histories[selectedTabId] || [];
	const currentIndex = historyIndex[selectedTabId] ?? 0;

	/* --------------------------
     SYNC ADDRESS BAR
  -------------------------- */

	useEffect(() => {
		if (selectedTab) {
			setAddressBar(selectedTab.rawUrl);
		}
	}, [selectedTab]);

	/* --------------------------
     CORE NAVIGATION
  -------------------------- */

	const updateTabUrl = (
		id: number,
		inputUrl: string,
		pushHistory = false,
	) => {
		const normalized = normalizeUrl(inputUrl);
		const resolved = resolveUrl(normalized);
		const title = extractTitle(normalized);

		setTabs((prev) =>
			prev.map((tab) =>
				tab.id === id
					? {
							...tab,
							rawUrl: normalized,
							resolvedUrl: resolved,
							title,
						}
					: tab,
			),
		);

		if (pushHistory) {
			setHistories((prev) => {
				const current = prev[id] || [];
				const idx = historyIndex[id] ?? current.length - 1;
				return {
					...prev,
					[id]: [...current.slice(0, idx + 1), normalized],
				};
			});

			setHistoryIndex((prev) => ({
				...prev,
				[id]: (prev[id] ?? 0) + 1,
			}));
		}
	};

	const addTab = () => {
		const id = nextId;

		const raw = normalizeUrl(defaultLink.link);

		setTabs((prev) => [
			...prev,
			{
				id,
				rawUrl: raw,
				resolvedUrl: resolveUrl(raw),
				title: extractTitle(raw),
			},
		]);

		setHistories((prev) => ({ ...prev, [id]: [defaultLink.link] }));
		setHistoryIndex((prev) => ({ ...prev, [id]: 0 }));

		setSelectedTabId(id);
		setNextId(id + 1);
	};

	const closeTab = (tab: Tab) => {
		setTabs((prev) => prev.filter((t) => t.id !== tab.id));

		if (selectedTabId === tab.id && tabs.length > 1) {
			const remaining = tabs.filter((t) => t.id !== tab.id);
			setSelectedTabId(remaining[0].id);
		}
	};

	const goBack = () => {
		if (currentIndex <= 0) return;

		const newIdx = currentIndex - 1;
		const rawUrl = currentHistory[newIdx];

		setHistoryIndex((prev) => ({
			...prev,
			[selectedTabId]: newIdx,
		}));

		updateTabUrl(selectedTabId, rawUrl);
	};

	const goForward = () => {
		if (currentIndex >= currentHistory.length - 1) return;

		const newIdx = currentIndex + 1;
		const rawUrl = currentHistory[newIdx];

		setHistoryIndex((prev) => ({
			...prev,
			[selectedTabId]: newIdx,
		}));

		updateTabUrl(selectedTabId, rawUrl);
	};

	const refresh = () => {
		if (!selectedTab) return;
		updateTabUrl(selectedTab.id, currentHistory[currentIndex]);
	};

	/* --------------------------
     BOOKMARKS
  -------------------------- */

	const toggleBookmark = () => {
		if (!currentUser || !selectedTab) return;

		const rawUrl = currentHistory[currentIndex];
		const exists = bookmarkBar.some((b) => b.link === rawUrl);

		const newBookmarks = exists
			? bookmarkBar.filter((b) => b.link !== rawUrl)
			: [...bookmarkBar, { link: rawUrl, title: rawUrl }];

		setBookmarkBar(newBookmarks);

		modifyUserProp(currentUser.username, "browserConfig", {
			...currentUser.browserConfig,
			bookmarks: newBookmarks,
		});
	};

	return {
		tabs,
		selectedTab,
		selectedTabId,
		addressBar,
		bookmarkBar,
		currentIndex,
		currentHistory,

		setSelectedTabId,
		setAddressBar,

		updateTabUrl,
		addTab,
		closeTab,
		goBack,
		goForward,
		refresh,
		toggleBookmark,

		isInternalUrl,
		isExternalUrl,
	};
};
