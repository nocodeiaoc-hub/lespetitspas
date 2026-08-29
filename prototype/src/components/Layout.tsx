import { NavLink, useNavigate } from "react-router-dom";
import {
  Baby,
  Inbox,
  LogOut,
  SquarePen,
  RefreshCw,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "../state/AppState";
import { inboxMessages } from "../state/selectors";
import { fullName, timeOf } from "../lib/format";
import { Avatar } from "./Avatar";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout, messages, lastSyncAt } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return <>{children}</>;

  const newCount = inboxMessages(messages).filter((m) => m.status === "nouveau").length;

  const items: NavItem[] =
    currentUser.role === "staff"
      ? [
          { to: "/staff", label: "Enfants", icon: Users },
          { to: "/staff/messages", label: "Messages", icon: Inbox, badge: newCount },
        ]
      : [
          { to: "/parent", label: "Mes enfants", icon: Baby },
          { to: "/parent/messages/new", label: "Message", icon: SquarePen },
        ];

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden shrink-0 flex-col gap-1 border-r border-line px-4 py-6 md:flex md:w-60">
        <Brand />
        <nav className="mt-6 flex flex-col gap-1">
          {items.map((it) => (
            <SideLink key={it.to} item={it} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <ProfileCard />
          <button className="btn btn-ghost justify-start" onClick={onLogout}>
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre du haut mobile */}
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
          <Brand />
          <button
            className="btn btn-ghost"
            style={{ minHeight: 40, paddingInline: 10 }}
            onClick={onLogout}
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="flex items-center gap-2 px-4 pt-3 text-xs text-ink-soft">
          <RefreshCw size={12} />
          Dernière synchronisation à {timeOf(lastSyncAt)} · actualisez la page pour les
          nouveautés
        </div>

        <main className="flex-1 px-4 pb-28 pt-4 md:pb-10">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface md:hidden">
        {items.map((it) => (
          <BottomLink key={it.to} item={it} />
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
        style={{ background: "var(--color-primary-soft)" }}
      >
        👣
      </span>
      <span className="font-heading text-base font-extrabold leading-tight">
        Les Petits&nbsp;Pas
      </span>
    </div>
  );
}

function ProfileCard() {
  const { currentUser } = useApp();
  if (!currentUser) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-canvas px-3 py-2">
      <Avatar
        firstName={currentUser.firstName}
        lastName={currentUser.lastName}
        seed={currentUser.id}
        size={36}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{fullName(currentUser)}</p>
        <p className="text-xs text-ink-soft">
          {currentUser.role === "staff" ? "Équipe" : "Parent"}
        </p>
      </div>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
      style={{ background: "var(--color-accent)" }}
    >
      {count}
    </span>
  );
}

function SideLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive ? "bg-primary text-white" : "text-ink-soft hover:bg-primary-soft hover:text-ink"
        }`
      }
    >
      <Icon size={18} />
      {item.label}
      <Badge count={item.badge ?? 0} />
    </NavLink>
  );
}

function BottomLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
          isActive ? "text-primary-strong" : "text-ink-soft"
        }`
      }
    >
      <Icon size={20} />
      {item.label}
      {!!item.badge && (
        <span
          className="absolute right-1/4 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}
