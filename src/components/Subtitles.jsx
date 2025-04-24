import React, { useEffect, useState } from "react";
import subtitlesData from "../../public/subtitles.json";

const Subtitles = ({ currentTime }) => {
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    const activeSubtitle = subtitlesData.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    setCurrentSubtitle(activeSubtitle ? activeSubtitle.text : "");
  }, [currentTime]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "5%",
        width: "100%",
        textAlign: "center",
        color: "white",
        fontSize: "1.5rem",
        textShadow: "2px 2px 4px #000",
        pointerEvents: "none",
      }}
    >
      {currentSubtitle}
    </div>
  );
};

export default Subtitles;
