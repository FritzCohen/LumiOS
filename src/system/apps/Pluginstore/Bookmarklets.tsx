import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../lib/Button";
import { faRocket } from "@fortawesome/free-solid-svg-icons";

interface Script {
    name: string;
    script: () => void;
  }
  
const scripts: Script[] = [
    {
      name: "Lumi Bookmark",
      script: async () => {
        const content = await fetch(
          "https://raw.githubusercontent.com/LuminesenceProject/Bookmarklet/main/new.js"
        );
        const text = content.text();
        eval(await text);
      },
    },
    {
      name: "Crown JS",
      script: async () => {
        const content = await fetch(
          "https://raw.githubusercontent.com/jangodev/CrownJS/main/crown.js"
        );
        const text = content.text();
        eval(await text);
      },
    },
    {
      name: "Ego Client",
      script: () => {
        (function () {
          const scriptElement = document.createElement("script");
          const sourceUrl =
            "https://cdn.jsdelivr.net/gh/yeahbread/Ego-Menu-Bookmarklets/Menu.js";
  
          fetch(sourceUrl)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.text();
            })
            .then((sourceCode) => {
              scriptElement.text = sourceCode;
              document.body.appendChild(scriptElement);
            })
            .catch((error) => {
              alert("Error fetching script: " + error.message);
              console.error("Error fetching script:", error);
            });
        })();
      },
    },
    {
      name: "Car Axle Client",
      script: async () => {
        const content = await fetch(
          "https://raw.githubusercontent.com/car-axle-client/car-axle-client/main/dist/build.js"
        );
        const text = content.text();
        eval(await text);
      },
    },
    {
      name: "About:Blank",
      script: () => {
        const website = window.prompt("What website do you want?");
        const win: any = window.open();
  
        const waitForWindowOpen = new Promise((resolve) => {
          const intervalId = setInterval(() => {
            if (win && !win.closed) {
              clearInterval(intervalId);
              resolve(win);
            }
          }, 100);
        });
  
        waitForWindowOpen.then((win: any) => {
          win.document.body.style.margin = "0";
          win.document.body.style.height = "100vh";
  
          const iframe = win.document.createElement("iframe");
          iframe.style.border = "none";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.margin = "0";
          iframe.referrerpolicy = "no-referrer";
          iframe.allow = "fullscreen";
          iframe.src = website;
          win.document.body.appendChild(iframe);
        });
      },
    },
    {
      name: "Vengeance",
      script: () => {
        (function () {
          const v = document.createElement("script");
          v.src =
            "https://cdn.jsdelivr.net/gh/Browncha023/Vengeance@v1.2.0/script.min.js";
          document.body.appendChild(v);
        })();
      },
    },
];

const Bookmarklets = () => {
    const handleButtonClick = (index: number) => {
        scripts[index].script();
    };

    return ( 
        <>
          <h2 className="font-bold text-xl py-2">Bookmarklets</h2>
          <div className="plugin">
              {scripts.map((script, index) => (
              <div className="plugin-item" key={index}>
                  <span>{script.name}</span>
                  <Button onClick={() => handleButtonClick(index)}>
                  Run Script <FontAwesomeIcon icon={faRocket} />
                  </Button>
              </div>
              ))}
          </div>
        </>
     );
}
 
export default Bookmarklets;