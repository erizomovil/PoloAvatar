import React from 'react';
import { Experience } from './Experience';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { Leva } from "leva";

const VideoPage = ({ jsonData }) => {
    useEffect(() => {
      if (jsonData) {
        console.log("Using this JSON data:", jsonData);
      }
    }, [jsonData]);
    if (!jsonData) return <p>No data provided.</p>;

    return (
      <>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 40 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience jsonData={jsonData} />
      </Canvas>
      <Leva
        theme={{
          sizes: { rootWidth: "380px" },
          colors: {
            elevation1: "#1e1e1e",
            elevation2: "#2a2a2a",
            accent1: "#ff6347",
            highlight1: "#ffffff",
            folder: "#333",
            text: "#f0f0f0",
            selectedText: "#ffffff",
            input: "#ffffff",
            inputText: "#1e1e1e",
          },
          fontSizes: {
            root: "16px",
          },
          fonts: {
            mono: "'Fira Code', monospace",
          },
        }}
        collapsed={false}
      />
      </>
    );
  };

export default VideoPage;