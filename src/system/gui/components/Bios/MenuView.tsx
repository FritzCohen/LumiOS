import { BiosCommand } from "./biosTypes";

interface Props {
  title?: string;
  options: BiosCommand[];
  selected: number;
  onBack?: () => void; // optional callback for Back
}

export function MenuView({ title, options, selected, onBack }: Props) {
  const hasBack = Boolean(onBack);

  return (
    <div style={{ color: "green", textAlign: "center" }}>
      {title && <h3 className="text-xl mb-4">{title}</h3>}

      {options.map((opt, i) => (
        <div
          key={i}
          style={{
            padding: 10,
            border: selected === i ? "1px solid green" : "none",
            fontWeight: selected === i ? "bold" : "normal",
            color: "green",
          }}
        >
          {selected === i ? `[${opt.label}]` : opt.label}
        </div>
      ))}

      {hasBack && (
        <div
          style={{
            padding: 10,
            border: selected === options.length ? "1px solid green" : "none",
            fontWeight: selected === options.length ? "bold" : "normal",
          }}
        >
          {selected === options.length ? "[Back]" : "Back"}
        </div>
      )}
    </div>
  );
}
