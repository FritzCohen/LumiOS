import { useState } from "react";
import { useUser } from "../../../context/user/user";
import { useDebounce } from "../../../hooks/useDebounce";
import Input from "../../lib/Input";
import { User } from "../../../context/user/userTypes";

const CloakConfig = () => {
  const { currentUser, modifyUserProp } = useUser();

  const { panic } = currentUser as User;

  // Local state (controlled inputs)
  const [title, setTitle] = useState(panic.title);
  const [favicon, setFavicon] = useState(panic.favicon);
  const [key, setKey] = useState(panic.key);
  const [website, setWebsite] = useState(panic.website);

  // Debouncers
  const titleDebounce = useDebounce(
    () => modifyUserProp((currentUser as User).username, "panic.title", title),
    400
  );

  const faviconDebounce = useDebounce(
    () => modifyUserProp((currentUser as User).username, "panic.favicon", favicon),
    400
  );

  const keyDebounce = useDebounce(
    () => modifyUserProp((currentUser as User).username, "panic.key", key),
    400
  );

  const websiteDebounce = useDebounce(
    () => modifyUserProp((currentUser as User).username, "panic.website", website),
    400
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold text-xl">Config</h2>

      <div className="p-4 rounded-lg shadow bg-surfaceAlt">
        {/* Tab Title */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold">Tab Title</h4>
            <p className="text-sm opacity-70">
              Change the tab title to what you want displayed.
            </p>
          </div>

          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              titleDebounce.run();
            }}
            onBlur={titleDebounce.flush}
          />
        </div>

        {/* Favicon */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold">Favicon</h4>
            <p className="text-sm opacity-70">
              Change the tab image to something else.
            </p>
          </div>

          <Input
            value={favicon}
            onChange={(e) => {
              setFavicon(e.target.value);
              faviconDebounce.run();
            }}
            onBlur={faviconDebounce.flush}
          />
        </div>
      </div>

      <div className="p-4 rounded-lg shadow bg-surface">
        {/* Panic key */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold">Panic Key</h4>
            <p className="text-sm opacity-70">
              Click this key to navigate to the panic website
            </p>
          </div>

          <Input
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              keyDebounce.run();
            }}
            onBlur={keyDebounce.flush}
          />
        </div>

        {/* Panic website */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold">Panic Website</h4>
            <p className="text-sm opacity-70">
              Clicking the panic key goes to this website
            </p>
          </div>

          <Input
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              websiteDebounce.run();
            }}
            onBlur={websiteDebounce.flush}
          />
        </div>
      </div>
    </div>
  );
};

export default CloakConfig;