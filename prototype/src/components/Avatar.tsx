import { useState } from "react";
import { avatarColor, initials } from "../lib/format";

interface Props {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  seed: string;
  size?: number;
}

/** Photo si disponible, sinon initiales sur fond colore deterministe. */
export function Avatar({ firstName, lastName, photoUrl, seed, size = 44 }: Props) {
  const [broken, setBroken] = useState(false);
  const showPhoto = photoUrl && !broken;
  const dim = { width: size, height: size, minWidth: size };

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        onError={() => setBroken(true)}
        style={{ ...dim, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        ...dim,
        borderRadius: "50%",
        background: avatarColor(seed),
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontFamily: "var(--font-heading)",
        fontSize: size * 0.38,
      }}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
