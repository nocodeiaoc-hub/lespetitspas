"use client";

import { useState } from "react";
import { avatarColor, cn, initials } from "@/lib/utils";

type Props = {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  /** Graine de la couleur de repli (l'id de l'enfant). */
  seed: string;
  className?: string;
};

/** Photo de l'enfant si disponible, sinon initiales sur fond coloré déterministe. */
export function ChildAvatar({
  firstName,
  lastName,
  photoUrl,
  seed,
  className,
}: Props) {
  const [broken, setBroken] = useState(false);
  const base = cn(
    "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-pill",
    className,
  );

  if (photoUrl && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        onError={() => setBroken(true)}
        className={cn(base, "object-cover")}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(base, "font-heading font-bold text-white")}
      style={{ backgroundColor: avatarColor(seed) }}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
