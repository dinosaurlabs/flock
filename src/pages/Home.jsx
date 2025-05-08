// src/pages/Home.jsx
import React, { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import PabloWave from "../components/SVGs/Pablo/PabloWave";
import bgBlob from "../assets/images/background-image.png"; // make sure this path is correct

function Home() {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  // inline style for the blob
  const blobStyle = {
    position: "absolute",
    top: "10%",
    left: "0%",
    width: "100%",
    height: "100%",
    backgroundImage: `url(${bgBlob})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center bottom",
    backgroundSize: "contain",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      {/* ——— the blob behind everything ——— */}
      <div style={blobStyle} aria-hidden="true" />

      {/* ——— your hero content ——— */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 -mt-20">
        <div className="flex flex-col items-center gap-9">
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center space-x-8">
              <PabloWave className="w-12 h-12 -rotate-12" />
              <h1 className="text-5xl font-medium text-center text-black font-display dark:text-white">
                Events take flight on{" "}
                <span className="font-bold text-primary">Flock</span>
              </h1>
              <PabloWave className="w-12 h-12 transform -scale-x-100 rotate-12" />
            </div>
            <p className="text-lg font-medium text-center text-secondary">
              Create or join a flock without all the hassle.
            </p>
          </div>

          <div className="w-full">
            <div className="flex flex-col w-full gap-2 p-2 border bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark rounded-2xl focus-within:ring-1 focus-within:border-onSurface dark:focus-within:border-onSurface-dark">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextChange}
                className="w-full overflow-y-auto custom-scrollbar bg-surfaceContainer dark:bg-surfaceContainer-dark p-2 text-onSurface resize-none focus:outline-none max-h-[150px]"
                rows={3}
                placeholder="Describe the event you are trying to schedule or copy and paste your code!"
              />
              <div className="flex justify-end">
                <button className="p-2 rounded-xl bg-border dark:bg-border-dark text-secondary">
                  <ArrowUpRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
