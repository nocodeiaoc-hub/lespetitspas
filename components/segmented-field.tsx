"use client";

import { useId } from "react";

type Option = { value: string; label: string };

/**
 * Choix unique parmi quelques options, rendu en puces.
 * S'appuie sur de vrais `<input type="radio">` : participe au formulaire et
 * supporte `required` nativement.
 */
export function SegmentedField({
  name,
  legend,
  options,
  required,
}: {
  name: string;
  legend: string;
  options: Option[];
  required?: boolean;
}) {
  const id = useId();

  return (
    <fieldset className="grid gap-1.5">
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="cursor-pointer rounded-pill bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              required={required}
              className="sr-only"
              aria-labelledby={`${id}-${opt.value}`}
            />
            <span id={`${id}-${opt.value}`}>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
