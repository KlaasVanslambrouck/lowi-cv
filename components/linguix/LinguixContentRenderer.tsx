import type {
  LinguixCalloutBlock,
  LinguixContentBlock,
  LinguixListBlock,
  LinguixParagraphBlock,
  LinguixQuoteBlock,
  LinguixTableAlignment,
  LinguixTableBlock,
  LinguixTableColumn,
} from "@/types/linguix";
import BusinessCaseModel from "./BusinessCaseModel";
import DrieKlokken from "./DrieKlokken";
import FaseringsTijdlijn from "./FaseringsTijdlijn";
import Herkadering from "./Herkadering";
import LinguixPlaceholder from "./LinguixPlaceholder";
import OplossingSchema from "./OplossingSchema";
import RisicoMatrix from "./RisicoMatrix";
import SchrijfScorer from "./SchrijfScorer";
import SpreekAgent from "./SpreekAgent";
import styles from "./LinguixContent.module.css";

interface LinguixContentRendererProps {
  blocks: readonly LinguixContentBlock[];
}

interface BlockRendererProps<TBlock extends LinguixContentBlock> {
  block: TBlock;
}

function ParagraphRenderer({
  block,
}: BlockRendererProps<LinguixParagraphBlock>) {
  const variantClass =
    block.variant === "lead"
      ? styles.paragraphLead
      : block.variant === "small"
        ? styles.paragraphSmall
        : "";

  return (
    <div className={styles.paragraphBlock}>
      {block.label ? (
        <span className={styles.contentLabel}>{block.label}</span>
      ) : null}
      <p className={`${styles.paragraph} ${variantClass}`}>{block.text}</p>
    </div>
  );
}

function QuoteRenderer({ block }: BlockRendererProps<LinguixQuoteBlock>) {
  return (
    <figure className={styles.quoteBlock}>
      {block.label ? (
        <figcaption className={styles.quoteLabel}>{block.label}</figcaption>
      ) : null}
      <blockquote className={styles.quoteText}>
        {block.paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </blockquote>
    </figure>
  );
}

function getAlignmentClass(alignment?: LinguixTableAlignment): string {
  if (alignment === "center") return styles.alignCenter;
  if (alignment === "end") return styles.alignEnd;
  return styles.alignStart;
}

function getCellClass(column: LinguixTableColumn): string {
  return [
    styles.tableCell,
    getAlignmentClass(column.align),
    column.numeric ? styles.numericCell : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function eersteTabel(
  blocks: readonly LinguixContentBlock[],
): LinguixTableBlock | undefined {
  return blocks.find(
    (block): block is LinguixTableBlock => block.type === "table",
  );
}

function TableRenderer({ block }: BlockRendererProps<LinguixTableBlock>) {
  return (
    <figure className={styles.tableFigure}>
      <div className={styles.tableViewport}>
        <table className={styles.table}>
          {block.caption ? (
            <caption className={styles.tableCaption}>{block.caption}</caption>
          ) : null}
          <thead>
            <tr>
              {block.columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.tableHeader} ${getAlignmentClass(column.align)}`}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.id} className={styles.tableRow}>
                {block.columns.map((column, columnIndex) => (
                  <td key={column.key} className={getCellClass(column)}>
                    {row.cells[columnIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.note ? <figcaption className={styles.tableNote}>{block.note}</figcaption> : null}
    </figure>
  );
}

function ListRenderer({ block }: BlockRendererProps<LinguixListBlock>) {
  const listItems = block.items.map((item, index) => (
    <li key={`${index}-${item.text.slice(0, 24)}`} className={styles.listItem}>
      <span>{item.text}</span>
      {item.children ? (
        <ul className={styles.nestedList}>
          {item.children.map((child, childIndex) => (
            <li key={`${childIndex}-${child.slice(0, 24)}`}>{child}</li>
          ))}
        </ul>
      ) : null}
    </li>
  ));

  return (
    <div className={styles.listBlock}>
      {block.title ? <h3 className={styles.listTitle}>{block.title}</h3> : null}
      {block.ordered ? (
        <ol className={`${styles.list} ${styles.orderedList}`}>{listItems}</ol>
      ) : (
        <ul className={styles.list}>{listItems}</ul>
      )}
    </div>
  );
}

function CalloutRenderer({ block }: BlockRendererProps<LinguixCalloutBlock>) {
  const toneClass =
    block.tone === "warning"
      ? styles.calloutWarning
      : block.tone === "risk"
        ? styles.calloutRisk
        : block.tone === "info"
          ? styles.calloutInfo
          : styles.calloutAccent;

  return (
    <aside className={`${styles.callout} ${toneClass}`}>
      {block.title ? <h3 className={styles.calloutTitle}>{block.title}</h3> : null}
      <div className={styles.calloutBody}>
        {block.paragraphs.map((paragraph, index) => {
          const structuredText = paragraph.includes("\n");

          return (
            <p
              key={`${index}-${paragraph.slice(0, 24)}`}
              className={structuredText ? styles.structuredText : undefined}
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    </aside>
  );
}

function assertNever(block: never): never {
  throw new Error(`Onbekend Linguix-inhoudstype: ${JSON.stringify(block)}`);
}

function renderBlock(
  block: LinguixContentBlock,
  index: number,
  blocks: readonly LinguixContentBlock[],
) {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case "paragraph":
      return <ParagraphRenderer key={key} block={block} />;
    case "quote":
      return <QuoteRenderer key={key} block={block} />;
    case "table":
      // Het risicoregister van blok 8 leest als matrix beter dan als tabel van
      // negen rijen. De tabel blijft de bron van beschrijving en mitigatie.
      if (block.caption === "Risicoregister") {
        return <RisicoMatrix key={key} tabel={block} />;
      }

      return <TableRenderer key={key} block={block} />;
    case "list":
      return <ListRenderer key={key} block={block} />;
    case "callout":
      return <CalloutRenderer key={key} block={block} />;
    case "placeholder":
      if (block.feature === "businesscase-model") {
        return <BusinessCaseModel key={key} />;
      }

      if (
        block.feature === "diagram" &&
        block.title === "Tijdlijn met drie klokken"
      ) {
        return <DrieKlokken key={key} />;
      }

      if (
        block.feature === "diagram" &&
        block.title === "Architectuur met twee sporen"
      ) {
        return <OplossingSchema key={key} />;
      }

      if (
        block.feature === "diagram" &&
        block.title === "AI als tweede corrector"
      ) {
        return <Herkadering key={key} />;
      }

      if (block.feature === "diagram" && block.title === "Fasering met gates") {
        const tabel = eersteTabel(blocks);
        if (tabel) return <FaseringsTijdlijn key={key} tabel={tabel} />;
      }

      if (block.feature === "scorer") {
        return <SchrijfScorer key={key} />;
      }

      if (block.feature === "spreekagent") {
        return <SpreekAgent key={key} />;
      }

      return <LinguixPlaceholder key={key} block={block} />;
    default:
      return assertNever(block);
  }
}

export default function LinguixContentRenderer({
  blocks,
}: LinguixContentRendererProps) {
  return <div className={styles.contentStack}>{blocks.map(renderBlock)}</div>;
}
