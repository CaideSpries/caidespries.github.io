import { useState, useEffect, useCallback } from "react";

const titles = [
  "Electrical & Computer Engineer",
  "Software Engineer",
  "Infrastructure Architect",
  "Startup Founder",
  "Renewable Energy Tech",
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_DURATION = 2000;

export default function TypedHero() {
  const [text, setText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentTitle = titles[titleIndex];

    if (!isDeleting) {
      setText(currentTitle.slice(0, text.length + 1));
      if (text.length + 1 === currentTitle.length) {
        setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
        return;
      }
    } else {
      setText(currentTitle.slice(0, text.length - 1));
      if (text.length - 1 === 0) {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % titles.length);
        return;
      }
    }
  }, [text, titleIndex, isDeleting]);

  useEffect(() => {
    const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className="neon-text">
      {text}
      <span className="animate-pulse" style={{ color: "#e85d3a" }}>|</span>
    </span>
  );
}
