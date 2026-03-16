import "./browser.css";
import BrowserTabs from "./UI/BrowserTabs";
import BrowserBookmarks from "./UI/BrowserBookmarks";
import BrowserNavigation from "./UI/BrowserNavigation";
import BrowserContent from "./UI/BrowserContent";
import { useBrowser } from "./useBrowser";

const Browser = () => {
  const browser = useBrowser({
	defaultLink: "https://api.codetabs.com/v1/proxy?quest=",
    proxyEnabled: true,
    proxyPrefix: "",
  });

  return (
    <div className="flex flex-col w-full h-full">
      <BrowserTabs
        tabs={browser.tabs}
        selectedTabId={browser.selectedTabId}
        onSelect={browser.setSelectedTabId}
        onClose={browser.closeTab}
        onAdd={browser.addTab}
      />

      <BrowserBookmarks
        bookmarks={browser.bookmarkBar}
        onNavigate={(url) =>
          browser.updateTabUrl(browser.selectedTabId, url, true)
        }
      />

      <BrowserNavigation
        addressBar={browser.addressBar}
        setAddressBar={browser.setAddressBar}
        onEnter={() =>
          browser.updateTabUrl(
            browser.selectedTabId,
            browser.addressBar,
            true
          )
        }
        onBack={browser.goBack}
        onForward={browser.goForward}
        onRefresh={browser.refresh}
        onBookmark={browser.toggleBookmark}
        canGoBack={browser.currentIndex > 0}
        canGoForward={
          browser.currentIndex < browser.currentHistory.length - 1
        }
      />

      <div className="flex-1 bg-white overflow-hidden">
        <BrowserContent
          selectedTab={browser.selectedTab}
          updateTabUrl={browser.updateTabUrl}
        />
      </div>
    </div>
  );
};

export default Browser;
