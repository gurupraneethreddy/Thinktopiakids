"use client";
import { useEffect, useRef, useState } from "react";

// Global state for audio management
let audioPlayersActive = 0;

export default function GlobalAudioPlayer() {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!userInteracted || !audioRef.current) return;

    // Initialize background music
    const initializeAudio = async () => {
      try {
        audioRef.current.muted = true;
        await audioRef.current.play();
        console.log('Background audio started');
      } catch (err) {
        console.error('Audio playback failed:', err);
      }
    };

    initializeAudio();

    // Global control function
    window.controlBackgroundMusic = (action) => {
      if (!audioRef.current) return;
      
      if (action === "pause") {
        audioPlayersActive++;
        audioRef.current.muted = true;
      } else if (action === "resume") {
        audioPlayersActive = Math.max(0, audioPlayersActive - 1);
        if (audioPlayersActive === 0) {
          audioRef.current.muted = false;
        }
      }
      setIsMuted(audioRef.current.muted);
    };

    return () => {
      delete window.controlBackgroundMusic;
    };
  }, [userInteracted]);

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !audioRef.current.muted;
      audioRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
      
      if (!newMuteState && audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 p-2 bg-gray-800 rounded-full shadow-lg">
      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-indigo-500 text-white focus:outline-none"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <audio
        ref={audioRef}
        src="/audio/calm.mp3"
        loop
        controls={false}
        className="hidden"
      />
    </div>
  );
}

// frontend/
//   public/audio
//   src/app/audiobooks
//   src/app/layout.tsx
//   src/app/global.css
//   src/components/GlobalAudioPlayer.js
// package.json => npm i react-h5-audio-player

// backend/
//   serverHooks.js
