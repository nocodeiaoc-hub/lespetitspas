interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="chip"
              style={{
                minHeight: 40,
                paddingInline: 14,
                textTransform: "capitalize",
                background: active ? "var(--color-primary)" : "var(--color-primary-soft)",
                color: active ? "#fff" : "var(--color-ink)",
              }}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
