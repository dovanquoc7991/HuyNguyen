import React, { useEffect } from 'react';

interface TimerProps {
  timeLeft: number;
  submitted: boolean;
  onTimeout: () => void;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, submitted, onTimeout, setTimeLeft }) => {
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, onTimeout, setTimeLeft]);

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div id="timer-container">
      ⏰ {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;