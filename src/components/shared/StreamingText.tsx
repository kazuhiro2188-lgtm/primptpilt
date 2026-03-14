"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StreamingTextProps {
  text: string;
  className?: string;
  showCursor?: boolean;
}

export function StreamingText({
  text,
  className,
  showCursor = true,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayedText(text);
  }, [text]);

  useEffect(() => {
    if (!showCursor) return;
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [showCursor]);

  return (
    <div className={className}>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {displayedText}
        {showCursor && (
          <motion.span
            animate={{ opacity: cursorVisible ? 1 : 0 }}
            className="inline-block w-2 bg-primary ml-0.5 align-middle"
          />
        )}
      </pre>
    </div>
  );
}
