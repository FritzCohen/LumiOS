import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { Game } from "../appstoreTypes";
import { useKernel } from "../../../../hooks/useKernal";
import virtualFS from "../../../api/virtualFS";
import { Directory, File } from "../../../api/types";
import { useUser } from "../../../../context/user/user";
import SWFPlayer from "./SWFPlayer";

const PlayGame: React.FC<{
  props: OpenedApp;
  game: Game;
  cloudPlay: boolean;
}> = ({ props, game, cloudPlay }) => {
  const { bringToFront } = useKernel();
  const { userDirectory } = useUser();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!props) return;
    bringToFront(props.id);
  }, [props, bringToFront]);

  // 🔹 Recursively reconstruct folder
  const buildTree = async (path: string): Promise<Record<string, any>> => {
    const dir: Record<string, File | Directory> = await virtualFS.readdir(path);
    const result: Record<string, any> = {};

    for (const [name, node] of Object.entries(dir)) {
      if (node.type === "directory") {
        result[name] = await buildTree(`${path}/${name}`);
      } else {
        const file = await virtualFS.readfile(path, name);
        result[name] = file.content;
      }
    }

    return result;
  };

  const injectGame = async () => {
    setLoading(true);

    let tree: Record<string, any>;

    if (cloudPlay) {
      const fetched = await fetch(game.path);
      const text = await fetched.text();
      tree = { "index.html": text };
    } else {
      tree = await buildTree(`${userDirectory}/DownloadedGames/${game.name}/`);
    }

    // 🔑 Build Blob URLs for every file
    const blobMap: Record<string, string> = {};
    const buildBlobs = (folder: any, prefix = "") => {
      for (const [name, value] of Object.entries(folder)) {
        if (typeof value === "object" && value !== null) {
          buildBlobs(value, `${prefix}${name}/`);
        } else {
          const type = name.endsWith(".css")
            ? "text/css"
            : name.endsWith(".js")
            ? "application/javascript"
            : "text/html";

          const blob = new Blob([value as string], { type });
          blobMap[`${prefix}${name}`] = URL.createObjectURL(blob);
        }
      }
    };
    buildBlobs(tree);

    // 🔑 Grab entrypoint
        // Use index.html if it exists, otherwise the first file in root
    const entryFile =
      tree["index.html"] ??
      tree[Object.keys(tree)[0]];
    if (!entryFile) {
      console.error("No index.html found in game folder.");
      setLoading(false);
      return;
    }

    // 🔑 Rewrite relative paths in HTML → blob URLs
    let patchedHtml = entryFile as string;
    for (const [path, blobUrl] of Object.entries(blobMap)) {
      const safePath = path.replace(/\./g, "\\."); // escape dots for regex
      const regex = new RegExp(`(["'])(${safePath})(["'])`, "g");
      patchedHtml = patchedHtml.replace(regex, `$1${blobUrl}$3`);
    }

    // 🔑 Inject into iframe
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.srcdoc = patchedHtml;
    }

    setLoading(false);
  };

  useEffect(() => {
    if (game.type === "html") injectGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, cloudPlay]);

  return (
    <div className="w-full h-full flex flex-col">
      {game.type === "html" ? <>
        {loading && <div className="text-xs text-gray-400">Loading game…</div>}
        <iframe
          ref={iframeRef}
          className="flex-1 w-full"
          sandbox="allow-scripts allow-same-origin"
          title={game.name}
        />
      </> : <SWFPlayer name={game.name} path={game.path} />}
    </div>
  );
};

export default PlayGame;