import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";
import { useState, useEffect, useRef } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import avatarConfig from "./avatar-config.json";
import "./Experience.css"

export const Experience = ({ jsonData }) => {
  const texture = useTexture("textures/Background.jpg");
  const whiteTexture = useTexture("textures/White.jpg");
  const blackTexture = useTexture("textures/Black.jpg");
  const greenTexture = useTexture("textures/Green.jpg");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const audioContext = new AudioContext();
  const audioSourceRef = useRef(null); 
  const destination = audioContext.createMediaStreamDestination();
  const viewport = useThree((state) => state.viewport);
  const [backgroundState, setBackgroundState] = useState("Image");
  const [avatarSettings, setAvatarSettings] = useState(jsonData || avatarConfig);
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [playTrigger, setPlayTrigger] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const { gl } = useThree();

  const animationControls = avatarSettings.animationTriggers.reduce((controls, trigger) => {
    controls[`Play ${trigger.action}`] = {
      value: activeAnimation === trigger.action,  
      group: "Animations",
      onChange: (value) => {
        if (value) {
          setActiveAnimation(trigger.action);
        } else {
          setActiveAnimation(null);
        }
      },
      button: true,
    };
    return controls;
  }, {});  

  const controls = useControls({
    background: {
      value: "Image",
      options: ["Image", "Green", "White", "Black"],
      onChange: (value) => setBackgroundState(value),
      group: "Fondo",
      style: {
        backgroundColor: "#ff6347",
        color: "#ffffff",
      },
    },
    "Toggle Animación": {
      value: false,
      onChange: (value) => {
        setPlayTrigger({ name: value ? "loopTalk" : null, id: Date.now() });
      },
      group: "Animación",
      button: true,
      style: {
        backgroundColor: "#008080",
        color: "#fff",
      },
    },
    "Record Screen": {
      value: false,
      onChange: (value) => handleRecordToggle(value),
      group: "Grabación",
      button: true,
      style: {
        backgroundColor: "#32cd32",
        color: "#fff",
      },
    },
  });

  const getTexture = (state) => {
    switch (state) {
      case "Image": return texture;
      case "Green": return greenTexture;
      case "White": return whiteTexture;
      case "Black": return blackTexture;
      default: return texture;
    }
  };

  const handleRecordToggle = (startRecording) => {
    if (startRecording) {
      startRecordingScreen();
    } else {
      stopRecordingScreen();
    }
  };

  const startRecordingScreen = async () => {
    try {
      const canvasStream = gl.domElement.captureStream(30);
      const response = await fetch(avatarSettings.audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(destination);
      source.connect(audioContext.destination);
      source.start();
      audioSourceRef.current = source;
      setActiveAnimation("loopTalk"); 
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);
      const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm" });
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        console.log("Video URL:", url);
        const a = document.createElement("a");
        a.href = url;
        a.download = "grabacion.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        recordedChunksRef.current = [];
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      console.log("Grabación iniciada 🎬 con audio y animación");
      source.onended = () => {
        handleAudioEnd();
        stopRecordingScreen();
      };
    } catch (err) {
      console.error("Error al iniciar la grabación con audio:", err);
    }
  };  
  
  const stopRecordingScreen = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } 
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        console.warn("Audio ya detenido o error al detener:", e);
      }
      audioSourceRef.current = null;
    }
  };
  
  const handleAudioEnd = () => {
    setPlayTrigger({ name: null, id: Date.now() });
    setActiveAnimation(null);
  };

  const activeTriggers = Object.keys(animationControls)
    .filter((key) => controls[key])
    .map((key) => ({
      action: key.replace("Play ", ""),
    }));
  
    useEffect(() => {
      if (activeAnimation) {
        setPlayTrigger({ name: activeAnimation, id: Date.now() });
      } else {
        setPlayTrigger({ name: null, id: Date.now() });
      }
    }, [activeAnimation]);

    useEffect(() => {
      if (isRecording) {
        document.body.style.border = "4px solid red";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
      } else {
        document.body.style.border = "none";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
      }
      return () => {
        document.body.style.border = "none";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
      };
    }, [isRecording]);

  return (
    <>
      <OrbitControls enabled={false} />
      <Avatar
        position={[0, -3, 5]}
        scale={2}
        modelPath={avatarSettings.modelPath}
        idleAnimationPath={avatarSettings.idleAnimationPath}
        introAnimationPath={avatarSettings.introAnimationPath}
        greetingAnimationPath={avatarSettings.greetingAnimationPath}
        talkingAnimationPaths={avatarSettings.talkingAnimationPaths}
        talkingAnimationNames={avatarSettings.talkingAnimationNames}
        audioFile={avatarSettings.audioFile}
        animationTriggers={activeTriggers}
        triggerAnimation={playTrigger}
        onAudioEnd={handleAudioEnd}
        isRecording={isRecording}
      />
      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={getTexture(backgroundState)} />
      </mesh>
    </>
  );
};
