import { Link } from "react-router-dom";
import { ChevronRight, Heart, MessageCircle } from "lucide-react";
import { useApp } from "../../state/AppState";
import { lastEventForChild, visibleChildren } from "../../state/selectors";
import { eventSummary, timeOf, todayISO } from "../../lib/format";
import { Avatar } from "../../components/Avatar";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { WeatherCard } from "../../components/WeatherCard";

export function ParentChildren() {
  const { currentUser, events } = useApp();
  const children = visibleChildren(currentUser);
  const today = todayISO();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Bonjour ${currentUser?.firstName ?? ""}`.trim()}
        subtitle="La journée de vos enfants, au jour le jour"
      />

      {children.length === 0 ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="Aucun enfant rattaché à votre compte"
          description="Si vous pensez qu'il s'agit d'une erreur, contactez directement la crèche : elle rattachera votre enfant à votre compte."
        />
      ) : (
        <>
          <WeatherCard isoDate={today} />

          <div className="flex flex-col gap-3">
            {children.map((c) => {
              const last = lastEventForChild(events, c.id, today);
              return (
                <div key={c.id} className="card flex flex-col gap-3 p-4">
                  <Link to={`/parent/children/${c.id}`} className="flex items-center gap-3">
                    <Avatar
                      firstName={c.firstName}
                      lastName={c.lastName}
                      photoUrl={c.photoUrl}
                      seed={c.id}
                      size={52}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-lg font-bold">{c.firstName}</p>
                      <p className="text-sm text-ink-soft">
                        {last
                          ? `${eventSummary(last)} · ${timeOf(last.createdAt)}`
                          : "Aucun événement enregistré aujourd'hui"}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-ink-soft" />
                  </Link>
                  <div className="flex gap-2 border-t border-line pt-3">
                    <Link
                      to={`/parent/children/${c.id}`}
                      className="btn btn-secondary flex-1"
                      style={{ minHeight: 42 }}
                    >
                      Voir la journée
                    </Link>
                    <Link
                      to={`/parent/messages/new?child=${c.id}`}
                      className="btn btn-primary flex-1"
                      style={{ minHeight: 42 }}
                    >
                      <MessageCircle size={16} /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
