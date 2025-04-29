
"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaBookmark,
} from "react-icons/fa";

const YoutubeAudio = ({ videoUrl, audiobookId }) => {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0); // current seek position
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  // Bookmark state
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarkInput, setShowBookmarkInput] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState("");

  // Track the last sent cumulative played time (in seconds)
  const [lastSentDuration, setLastSentDuration] = useState(0);

  // Track actual played time within the current session
  const sessionPlayedTimeRef = useRef(0);

  // --- Player Controls ---
  const handlePlayPause = () => {
    setPlaying((prev) => !prev);

    // Send any pending time when pausing
    if (playing) {
      updateDurationToBackend();
    }
  };

  // Update played seconds for UI
  const handleProgress = (state) => {
    const roundedSeconds = Math.floor(state.playedSeconds);
    if (roundedSeconds !== playedSeconds) {
      setPlayedSeconds(roundedSeconds);
    }
  };

  const handleDuration = (dur) => setDuration(dur);

  // On seek/skip, update the seek position and reset session played time
  const handleSeek = (value) => {
    if (playerRef.current) {
      updateDurationToBackend(); // Send pending time before seeking
      playerRef.current.seekTo(value, "seconds");
      setPlayedSeconds(value);
      sessionPlayedTimeRef.current = 0; // Reset session time after seeking
    }
  };

  const skipForward = () => {
    const newTime = Math.min(playedSeconds + 10, duration);
    handleSeek(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(playedSeconds - 10, 0);
    handleSeek(newTime);
  };

  const handleVolumeChange = (val) => {
    const vol = val / 100;
    setVolume(vol);
    setMuted(vol === 0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // --- Send Progress to Backend ---
  const updateDurationToBackend = async (retries = 3) => {
    if (!audiobookId) return;
    const token = localStorage.getItem("token");

    const durationToSend = Math.floor(sessionPlayedTimeRef.current);
    if (durationToSend <= 0) return;

    try {
      const response = await fetch(
        `http://localhost:5000/track-duration/${audiobookId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ duration: durationToSend }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save progress");

      console.log(
        `Updating duration for student: 2 and audiobook: ${audiobookId} with duration: ${durationToSend}`
      );

      // Reset session time after successful send
      sessionPlayedTimeRef.current = 0;
      setLastSentDuration((prev) => prev + durationToSend);
    } catch (err) {
      console.error("Progress update failed:", err);
      if (retries > 0) {
        setTimeout(() => updateDurationToBackend(retries - 1), 1000);
      }
    }
  };

  // --- Periodic Progress Update ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (playing && sessionPlayedTimeRef.current > 0) {
        updateDurationToBackend();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      updateDurationToBackend(); // Send remaining progress on unmount
    };
  }, [playing, audiobookId]);

  // Track session played time every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (playing) {
        sessionPlayedTimeRef.current += 1;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playing]);

  // --- Bookmark Functions ---
  const fetchBookmarks = () => {
    if (!audiobookId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/bookmarks/${audiobookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bookmarks) setBookmarks(data.bookmarks);
      })
      .catch((err) => console.error("Fetch bookmarks error:", err));
  };

  useEffect(() => {
    if (audiobookId) fetchBookmarks();
  }, [audiobookId]);

  const addBookmark = () => {
    if (!newBookmarkName.trim()) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        audiobook_id: audiobookId,
        name: newBookmarkName,
        time: playedSeconds,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bookmark) {
          setBookmarks((prev) => [...prev, data.bookmark]);
        }
      })
      .catch((err) => console.error("Add bookmark error:", err));
    setNewBookmarkName("");
    setShowBookmarkInput(false);
  };

  const deleteBookmark = (bookmarkId) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/bookmarks/${bookmarkId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(() => {
        setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
      })
      .catch((err) => console.error("Delete bookmark error:", err));
  };

  const jumpToBookmark = (bookmark) => {
    if (playerRef.current) {
      updateDurationToBackend(); // Send pending time before jump
      playerRef.current.seekTo(bookmark.time, "seconds");
      setPlayedSeconds(bookmark.time);
      sessionPlayedTimeRef.current = 0; // Reset session time after jump
    }
  };

  return (
    <div className="flex flex-col w-full bg-gradient-to-r from-purple-600 to-purple-500 p-4 rounded-2xl shadow-1xl">
      {/* Hidden ReactPlayer */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="0"
        height="0"
      />

      {/* Seek Slider */}
      <div className="w-full relative">
        <Slider
          min={0}
          max={duration}
          value={playedSeconds}
          onChange={handleSeek}
          trackStyle={{ backgroundColor: "white", height: 6 }}
          handleStyle={{
            borderColor: "white",
            height: 18,
            width: 18,
            backgroundColor: "white",
            cursor: "pointer",
          }}
          styles={{ rail: { backgroundColor: "gray", height: 6 } }}
        />
        <div className="flex justify-between text-xs text-white px-1 mt-1">
          <span>{formatTime(playedSeconds)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <button onClick={() => setMuted(!muted)} className="text-white p-2" title="Toggle Mute">
            {muted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
          </button>
          <div className="w-24">
            <Slider
              min={0}
              max={100}
              value={volume * 100}
              onChange={handleVolumeChange}
              trackStyle={{ backgroundColor: "white", height: 4 }}
              handleStyle={{
                borderColor: "white",
                height: 16,
                width: 16,
                backgroundColor: "white",
                cursor: "pointer",
              }}
              railStyle={{ backgroundColor: "gray", height: 4 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-8 justify-center flex-1">
          <button className="text-white p-2" onClick={skipBackward}>
            <FaBackward className="text-2xl" />
          </button>
          <button
            className="bg-white text-purple-700 p-2 rounded-full shadow-md flex justify-center items-center"
            onClick={handlePlayPause}
          >
            {playing ? (
              <span className="flex items-center justify-center">
                <FaPause className="text-xl" />
              </span>
            ) : (
              <span className="flex items-center justify-center transform translate-x-0.5">
                <FaPlay className="text-xl" />
              </span>
            )}
          </button>
          <button className="text-white p-2" onClick={skipForward}>
            <FaForward className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setShowBookmarkInput((prev) => !prev)}
            className="text-white p-2"
            title="Add Bookmark"
          >
            <FaBookmark className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Bookmark Section */}
      {(showBookmarkInput || bookmarks.length > 0) && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          {showBookmarkInput && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter bookmark name"
                value={newBookmarkName}
                onChange={(e) => setNewBookmarkName(e.target.value)}
                className="border rounded p-2 w-full mb-2"
              />
              <button
                onClick={addBookmark}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Save Bookmark
              </button>
            </div>
          )}
          {bookmarks.length > 0 && (
            <ul className="space-y-2">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold">{bookmark.name}</p>
                    <p className="text-sm text-gray-600">{formatTime(bookmark.time)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => jumpToBookmark(bookmark)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default YoutubeAudio;
