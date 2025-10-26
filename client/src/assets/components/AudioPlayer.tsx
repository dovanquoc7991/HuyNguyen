import React, { useRef, useState, useEffect } from "react";
import "../css/AudioPlayer.css";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaBolt,
} from "react-icons/fa";

interface AudioPlayerProps {
  audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = Number(e.target.value);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioData = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Auto play khi load page
    audio.play().catch(() => {
      console.log("Auto-play bị chặn bởi trình duyệt.");
    });

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <div className="audio-player">
      <div className="progress-container">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button onClick={() => handleSkip(-10)}>
          <FaStepBackward /> 10s
        </button>

        <button className="play-btn" onClick={handlePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button onClick={() => handleSkip(10)}>
          10s <FaStepForward />
        </button>

        <div className="volume-control">
          <button onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>

        <div className="speed-control">
          <label htmlFor="speed">
            <FaBolt />
          </label>
          <select id="speed" value={playbackRate} onChange={handleSpeedChange}>
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc} />
    </div>
  );
};

export default AudioPlayer;
