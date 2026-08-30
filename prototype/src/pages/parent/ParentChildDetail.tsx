import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useApp } from "../../state/AppState";
import {
  eventsForChildOnDate,
  getChild,
  isChildLinkedToParent,
} from "../../state/selectors";
import { ageLabel, humanDate, todayISO } from "../../lib/format";
import { Avatar } from "../../components/Avatar";
import { DateSelector } from "../../components/DateSelector";
import { Timeline } from "../../components/Timeline";
import { WeatherCard } from "../../components/WeatherCard";

export function ParentChildDetail() {
  const { id } = useParams();
  const { events, currentUser } = useApp();
  const [date, setDate] = useState(todayISO());

  const child = getChild(id);

  // Verification "cote serveur" : l'enfant doit etre rattache au parent connecte.
  if (!child || !isChildLinkedToParent(child, currentUser)) {
    return <Navigate to="/parent" replace />;
  }

  const dayEvents = eventsForChildOnDate(events, child.id, date);

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/parent"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} /> Mes enfants
      </Link>

      <header className="card flex items-center gap-4 p-4">
        <Avatar
          firstName={child.firstName}
          lastName={child.lastName}
          photoUrl={child.photoUrl}
          seed={child.id}
          size={56}
        />
        <div className="flex-1">
          <h1 className="font-heading text-xl font-extrabold">{child.firstName}</h1>
          <p className="text-sm text-ink-soft">
            {child.section} · {ageLabel(child.birthDate)}
          </p>
        </div>
        <Link
          to={`/parent/messages/new?child=${child.id}`}
          className="btn btn-primary"
          style={{ minHeight: 42 }}
        >
          <MessageCircle size={16} /> Message
        </Link>
      </header>

      <WeatherCard isoDate={date} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-extrabold">
          Journée · <span className="font-bold text-ink-soft">{humanDate(date)}</span>
        </h2>
        <DateSelector value={date} onChange={setDate} />
      </div>

      <p className="text-xs text-ink-soft">
        Les événements sont saisis par l'équipe de la crèche. Le prénom de la personne qui
        a renseigné chaque événement est indiqué.
      </p>

      <Timeline events={dayEvents} isoDate={date} showAuthor />
    </div>
  );
}
