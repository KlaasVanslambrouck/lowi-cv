import type { LinguixPlaceholderBlock } from "@/types/linguix";
import styles from "./LinguixContent.module.css";

interface LinguixPlaceholderProps {
  block: LinguixPlaceholderBlock;
}

export default function LinguixPlaceholder({
  block,
}: LinguixPlaceholderProps) {
  return (
    <aside className={styles.placeholder} aria-label={block.statusLabel}>
      <span className={styles.placeholderStatus}>{block.statusLabel}</span>
      <h3 className={styles.placeholderTitle}>{block.title}</h3>
      <p className={styles.placeholderDescription}>{block.description}</p>
    </aside>
  );
}
