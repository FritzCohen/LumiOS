import Button from "../../../lib/Button";
import { Tab } from "../types";

interface Props {
  selectedTab?: Tab;
  updateTabUrl: (id: number, url: string, push?: boolean) => void;
}

const BrowserContent: React.FC<Props> = ({ selectedTab, updateTabUrl }) => {
  if (!selectedTab)
    return <div className="p-4">Select or add a tab to continue browsing.</div>;

  console.log(selectedTab);
  

  const isExternal = /^(https?:|\/\/)/.test(selectedTab.resolvedUrl);
  const internalRoutes = ["/home", "/settings", "/proxy", "/force", "/secret"];

  if (!internalRoutes.includes(selectedTab.resolvedUrl) && !isExternal) {
    return <p className="p-4">Invalid or unsupported internal URL.</p>;
  }

  switch (selectedTab.resolvedUrl) {
    case "/home":
      return (
        <div className="w-full h-full flex flex-col items-center py-5">
          <h3 className="font-bold text-2xl">Home</h3>
          <p className="font-light">
            This is NOT a proxy. No sites will be unblocked.
          </p>
          <p className="font-light">
            Your device may block iframes.
          </p>
        </div>
      );

    case "/secret":
      return (
        <div className="w-full h-full flex flex-col items-center py-5">
          hey you found it!
          <Button
            style={{ color: "pink" }}
            onClick={() =>
              updateTabUrl(
                selectedTab.id,
                "https://forms.gle/FreSQcN1RGr265gf8"
              )
            }
          >
            Click here.
          </Button>
        </div>
      );

    case "/settings":
    case "/proxy":
      return <div className="p-4">Nothing here...</div>;

    default:
      return (
<iframe
  src={selectedTab.resolvedUrl}
  className="w-full h-full border-none"
  title="Web View"
/>
      );
  }
};

export default BrowserContent;