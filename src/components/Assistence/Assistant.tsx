import React, { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { responses } from "./responses";
import { CustomSimilarity } from "./customSimilarity";
import Button from "../../system/lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Input from "../../system/lib/Input";

interface Assistant {
  onItemClick: (item: string | null) => void;
}

const Assistent: React.FC<Assistant> = () => {
  const [input, setInput] = useState<string>("");
  const [responsesList, setResponsesList] = useState<{ response: string, sender: "AI" | "USER" }[]>([]);
  const [similarity, setSimilarity] = useState<CustomSimilarity | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Memoize the phrases array to prevent unnecessary recalculations
  const phrases = useMemo(
    () => responses.flatMap((entry) => entry.inputs),
    [responses]
  );

  useEffect(() => {
    const customSimilarity = new CustomSimilarity();
    customSimilarity.fit(phrases);
    setSimilarity(customSimilarity);
  }, [phrases]); // Only run when `phrases` changes

  const processInput = async (input: string) => {
    if (!similarity) {
      console.error("Similarity model not loaded.");
      return;
    }

    setResponsesList((prev) => [...prev, { response: input, sender: "USER" }]);
    console.log(input);
    
    const bestMatch = similarity.findBestMatch(input, phrases);

    if (!bestMatch) {
      setResponsesList((prev) => [...prev, { response: "Sorry, I didn't understand that.", sender: "AI" }]);
      return;
    }

    const { phrase } = bestMatch;

    // Find the original response entry that contains the best-matched phrase
    const responseEntry = responses.find((entry) =>
      entry.inputs.includes(phrase)
    );

    if (!responseEntry) {
      setResponsesList((prev) => [...prev, { response: "Sorry, I didn't understand that.", sender: "AI" }]);
      return;
    }

    const randomResponse =
      responseEntry.responses[
        Math.floor(Math.random() * responseEntry.responses.length)
      ];

    // Call the func to get the context for replacement
    const context = await responseEntry.func(input);

    // Replace the {{context}} placeholder with the actual context (if any)
    const finalResponse = randomResponse.replace("{{context}}", context || "experience");

    setResponsesList((prev) => [...prev, { response: finalResponse, sender: "AI" }]);
    console.log(responsesList);
};


  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    processInput(input);
    setInput("");

    const inputRef = document.getElementById("inputRef") as HTMLInputElement;

    if (inputRef) {
      inputRef.value = "";
    }
  };

  const renderMessages = () => {
    return responsesList.map((message, index) => (
        <div
            key={index}
            className={`message ${message.sender === "AI" ? "text-left" : "text-right"} relative`}
            style={{
                maxWidth: "70%", // Limiting maximum width of messages for better readability
                alignSelf: message.sender === "AI" ? "flex-start" : "flex-end", // Aligning messages based on sender
                wordWrap: "break-word", // Ensure words wrap within the container
                overflowWrap: "break-word", // Break long words if necessary
                whiteSpace: "pre-wrap", // Ensure whitespace is handled correctly
                opacity: 0,
                transform: `translateX(${message.sender === "AI" ? "-100%" : "100%"})`,
                transition: "opacity 300ms ease, transform 300ms ease",
            }}
            ref={(el) => {
                if (el) {
                    setTimeout(() => {
                        el.style.opacity = "1";
                        el.style.transform = "translateX(0)";
                    }, 10);
                }
            }}
        >
            <span
                className={`p-2 rounded-lg shadow-md block ${message.sender === "AI" ? "bg-[#212121]" : "bg-secondary-light"}`} // Changed to block to ensure wrapping
            >
                {message.response}
            </span>
        </div>
    ));
  };

  return (
    <div ref={trayRef} className="app-tray glass assist max-h-[1/2]">
      <div className="flex flex-col h-full w-full justify-between">
        {responsesList.length === 0 && (
          <div className="text-center flex items-center flex-col">
            <h3 className="font-bold text-xl my-2">Assistant</h3>
            <p className="pb-3">Type "help" to get started!</p>
            <Button className="flex flex-row gap-2 my-1" onClick={(e) => {
              setInput("Hello!");
              handleSubmit(e);
            }}>
              <FontAwesomeIcon icon={faPaperPlane} /> Hello!
            </Button>
            <Button className="flex flex-row gap-2 my-1" onClick={(e) => {
              setInput("What's in the new update?");
              handleSubmit(e);
            }}>
              <FontAwesomeIcon icon={faPaperPlane} /> What's in the new update?
            </Button>
            <Button className="flex flex-row gap-2 my-1" onClick={(e) => {
              setInput("Tell me about settings.");
              handleSubmit(e);
            }}>
              <FontAwesomeIcon icon={faPaperPlane} /> Tell me about settings.
            </Button>
            <hr
              style={{ color: "gray" }}
              className="w-11/12 text-center mx-auto my-2"
            />
          </div>
        )}
        <div className="h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col overflow-y-auto px-2 h-full py-2 overflow-x-hidden">
            {renderMessages()}
            <div
              style={{ float: "left", clear: "both" }}
              ref={messagesEndRef}
            />
          </div>
          <form
            className="flex items-center gap-2 py-1 px-2"
            onSubmit={handleSubmit}
          >
            <Input
              type="text"
              id="inputRef"
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Type a message..."
              className="bg-secondary w-full cursor-pointer px-2 py-1 shadow-sm hover:bg-primary-light duration-100 ease-in-out transition-colors rounded text-text-base"
            />
            <Button
              type="submit"
              className="bg-secondary cursor-pointer px-2 py-1 shadow-sm hover:bg-primary-light duration-100 ease-in-out transition-colors rounded text-text-base min-w-min"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Assistent;
