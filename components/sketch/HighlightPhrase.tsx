"use client";

import Highlight from "./Highlight";
import type { SketchDelay } from "./sketchClasses";

interface HighlightPhraseProps {
  text: string;
  phrase?: string;
  delay?: SketchDelay;
}

// Markeert `phrase` binnen `text` als die er letterlijk in staat. Zo blijft de
// copy zelf ongewijzigd; staat de passage er niet (meer) in, dan gewone tekst.
export default function HighlightPhrase({ text, phrase, delay }: HighlightPhraseProps) {
  const index = phrase ? text.indexOf(phrase) : -1;
  if (!phrase || index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <Highlight delay={delay}>{phrase}</Highlight>
      {text.slice(index + phrase.length)}
    </>
  );
}
