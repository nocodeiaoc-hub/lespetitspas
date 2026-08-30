import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Mail, Pill, ShieldAlert } from "lucide-react";
import { useApp } from "../../state/AppState";
import {
  getChild,
  getProfile,
  eventsForChildOnDate,
  unreadMessagesForChild,
} from "../../state/selectors";
import { ageLabel, fullName, humanDate, timeOf, todayISO } from "../../lib/format";
import { Avatar } from "../../components/Avatar";
import { DateSelector } from "../../components/DateSelector";
import { EventForm } from "../../components/EventForm";
import { Modal } from "../../components/Modal";
import { Timeline } from "../../components/Timeline";
import { ErrorBanner } from "../../components/ErrorBanner";

export function StaffChildDetail() {
  const { id } = useParams();
  const { events, messages, addEvent, currentUser } = useApp();
  const [date, setDate] = useState(todayISO());
  const [formOpen, setFormOpen] = useState(false);

  const child = getChild(id);
  if (!child) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <ErrorBanner
          title="Enfant introuvable"
          message="Cette fiche n'existe pas ou a été retirée."
        />
      </div>
    );
  }

  const dayEvents = eventsForChildOnDate(events, child.id, date);
  const unread = unreadMessagesForChild(messages, child.id);

  return (
    <div className="flex flex-col gap-4">
      <BackLink />

      <header className="card flex items-center gap-4 p-4">
        <Avatar
          firstName={child.firstName}
          lastName={child.lastName}
          photoUrl={child.photoUrl}
          seed={child.id}
          size={60}
        />
        <div>
          <h1 className="font-heading text-xl font-extrabold">
            {child.firstName} {child.lastName}
          </h1>
          <p className="text-sm text-ink-soft">
            {child.section} · {ageLabel(child.birthDate)}
          </p>
        </div>
      </header>

      {/* Resume */}
      <section className="card flex flex-col gap-3 p-4">
        <h2 className="font-heading text-base font-bold">Résumé</h2>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink-soft">Allergies :</span>
          {child.allergies.length === 0 ? (
            <span className="text-sm text-ink-soft">Aucune allergie connue</span>
          ) : (
            child.allergies.map((a) => (
              <span
                key={a}
                className="chip"
                style={{ background: "var(--color-danger-soft)", color: "var(--color-danger-strong)" }}
              >
                <ShieldAlert size={13} /> {a}
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink-soft">Médicament :</span>
          <span
            className="chip"
            style={
              child.medicationAllowed
                ? { background: "var(--color-secondary-soft)", color: "#2f8f85" }
                : { background: "#eceff3", color: "#63748a" }
            }
          >
            <Pill size={13} />
            {child.medicationAllowed ? "Autorisation parentale au dossier" : "Aucune autorisation"}
          </span>
        </div>

        <div>
          <span className="text-sm font-semibold text-ink-soft">Parents rattachés :</span>
          <ul className="mt-1 flex flex-col gap-1">
            {child.familyProfileIds.length === 0 && (
              <li className="text-sm text-ink-soft">Aucun parent rattaché dans le prototype</li>
            )}
            {child.familyProfileIds.map((pid) => {
              const p = getProfile(pid);
              if (!p) return null;
              return (
                <li key={pid} className="text-sm">
                  {fullName(p)} <span className="text-ink-soft">· {p.email}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Messages non lus */}
      <section className="card flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold">
            Messages non traités
            {unread.length > 0 && (
              <span
                className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
                style={{ background: "var(--color-accent)" }}
              >
                {unread.length}
              </span>
            )}
          </h2>
          <Link to="/staff/messages" className="text-sm font-semibold text-primary-strong">
            Messagerie
          </Link>
        </div>
        {unread.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucun message en attente pour cet enfant.</p>
        ) : (
          unread.map((m) => (
            <div key={m.id} className="flex gap-2 rounded-lg bg-canvas px-3 py-2 text-sm">
              <Mail size={15} className="mt-0.5 shrink-0 text-ink-soft" />
              <span>
                <span className="text-ink-soft">
                  {getProfile(m.fromProfileId)?.firstName} · {timeOf(m.createdAt)} —{" "}
                </span>
                {m.body}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Timeline */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-extrabold">
            Journée · <span className="font-bold text-ink-soft">{humanDate(date)}</span>
          </h2>
          <DateSelector value={date} onChange={setDate} />
        </div>

        {date === todayISO() && (
          <button className="btn btn-primary self-start" onClick={() => setFormOpen(true)}>
            <CalendarPlus size={16} /> Ajouter un événement
          </button>
        )}

        <Timeline
          events={dayEvents}
          isoDate={date}
          onAddEvent={date === todayISO() ? () => setFormOpen(true) : undefined}
        />
      </section>

      <Modal
        open={formOpen}
        title={`Ajouter un événement · ${child.firstName}`}
        onClose={() => setFormOpen(false)}
      >
        <EventForm
          child={child}
          authorId={currentUser?.id ?? "u-staff-1"}
          onCancel={() => setFormOpen(false)}
          onSubmit={(event) => {
            addEvent(event);
            setFormOpen(false);
            setDate(todayISO());
          }}
        />
      </Modal>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/staff" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
      <ArrowLeft size={16} /> Tous les enfants
    </Link>
  );
}
