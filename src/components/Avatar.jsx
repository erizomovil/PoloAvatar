import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useGraph } from "@react-three/fiber";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

export function Avatar({
  modelPath,
  idleAnimationPath,
  talkingAnimationPaths,
  talkingAnimationNames,
  audioFile,
  triggerAnimation,
  onAudioEnd,
  isRecording = false,
  ...props
}) {
  const { scene } = useGLTF(modelPath);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const group = useRef();
  const audioRef = useRef(new Audio());
  const [animation, setAnimation] = useState("Idle");
  const previousAnimation = useRef("Idle");
  const [isTalking, setIsTalking] = useState(false);

  const idleFBX = useFBX(idleAnimationPath);
  const talkingFBXs = talkingAnimationPaths.map((path) => useFBX(path));

  const allAnimations = useMemo(() => {
    const anims = [];
    if (idleFBX.animations[0]) {
      const clip = idleFBX.animations[0];
      clip.name = "Idle";
      anims.push(clip);
    }
    talkingFBXs.forEach((fbx, index) => {
      const clip = fbx.animations[0];
      if (clip) {
        clip.name = talkingAnimationNames[index] || `Talk_${index + 1}`;
        anims.push(clip);
      }
    });
    return anims;
  }, [idleFBX, talkingFBXs, talkingAnimationNames]);

  const { actions } = useAnimations(allAnimations, group);

  const crossFade = useCallback(
    (fromAnimName, toAnimName, duration = 0.3) => {
      const fromAction = actions[fromAnimName];
      const toAction = actions[toAnimName];
      if (fromAction && toAction && fromAnimName !== toAnimName) {
        toAction.reset().play();
        fromAction.crossFadeTo(toAction, duration, true);
      } else if (toAction && fromAnimName !== toAnimName) {
        toAction.reset().fadeIn(duration).play();
      }
      previousAnimation.current = toAnimName;
    },
    [actions]
  );
  
  useEffect(() => {
    if (!actions || !animation) return;
    if (animation !== previousAnimation.current) {
      actions[previousAnimation.current]?.fadeOut(0.3);
      actions[animation].reset().fadeIn(0.3).play();
      previousAnimation.current = animation;
    } else if (!actions[animation].isRunning()) {
      actions[animation].reset().play();
    }
  }, [animation, actions]);

  useEffect(() => {
    if (triggerAnimation?.name !== "loopTalk" || !actions || talkingAnimationNames.length === 0) return;
    let isCancelled = false;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const startLoop = async () => {
      setIsTalking(true);
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioFile;
      if (isRecording) {
        audio.volume = 0;
      } else {
        audio.volume = 1;
      };
      audio.play();
      const audioPromise = new Promise((resolve) => {
        audio.onended = () => {
          isCancelled = true;
          resolve();
        };
      });
      while (!audio.ended && !isCancelled) {
        const randomIndex = Math.floor(Math.random() * talkingAnimationNames.length);
        const randomAnim = talkingAnimationNames[randomIndex];
        crossFade(previousAnimation.current, "Idle", 0.3);
        await delay(300);
        crossFade("Idle", randomAnim, 0.3);
        const currentAction = actions[randomAnim];
        const duration = currentAction?.getClip()?.duration * 1000 || 1500;
        await delay(duration);
        crossFade(randomAnim, "Idle", 0.3);
        await delay(300);
      }
      await audioPromise;
      setIsTalking(false);
      setAnimation("Idle");
      if (onAudioEnd) onAudioEnd();
    };
    startLoop();
    return () => {
      isCancelled = true;
      audioRef.current?.pause();
      setAnimation("Idle");
    };
  }, [triggerAnimation, talkingAnimationNames, audioFile, actions]);    

  const avatarRotation = useMemo(
    () => (animation === "Talking" ? [0, -0.5, 0] : [0, 0, 0]),
    [animation]
  );

  return (
    <group {...props} dispose={null} ref={group} rotation={avatarRotation}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Avatar"
        geometry={nodes.Wolf3D_Avatar.geometry}
        material={materials.Wolf3D_Avatar}
        skeleton={nodes.Wolf3D_Avatar.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Avatar.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Avatar.morphTargetInfluences}
      />
    </group>
  );
}