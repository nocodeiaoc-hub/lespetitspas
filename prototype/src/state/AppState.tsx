import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { DayEvent, Message, MessageStatus, Profile } from "../data/types";
import {
  ALL_PROFILES,
  CHILDREN,
  seedEvents,
  seedMessages,
} from "../data/mock";
import { checkMedicationAllowed } from "../lib/format";

interface State {
  currentUserId: string | null;
  events: DayEvent[];
  messages: Message[];
  /** Bandeau "derniere synchronisation" (pas de temps reel dans le MVP). */
  lastSyncAt: string;
  /** Message d'erreur transitoire (ex. refus "serveur" du medicament). */
  toast: { kind: "error" | "success"; text: string } | null;
}

type Action =
  | { type: "login"; userId: string }
  | { type: "logout" }
  | { type: "addEvent"; event: DayEvent }
  | { type: "sendMessage"; message: Message }
  | { type: "setMessageStatus"; id: string; status: MessageStatus }
  | { type: "toast"; toast: State["toast"] };

const MAX_MESSAGE_LENGTH = 500;

function nowISO(): string {
  return new Date().toISOString();
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "login":
      return { ...state, currentUserId: action.userId, toast: null };
    case "logout":
      return { ...state, currentUserId: null, toast: null };
    case "addEvent": {
      // Garde-fou "serveur" : la Server Action refuserait un medicament sans autorisation.
      if (action.event.type === "médicament") {
        const child = CHILDREN.find((c) => c.id === action.event.childId);
        const guard = checkMedicationAllowed({
          child: child ?? { medicationAllowed: false },
          parentalConsentConfirmed: action.event.parentalConsentConfirmed,
        });
        if (!guard.allowed) {
          return {
            ...state,
            toast: { kind: "error", text: guard.reason ?? "Enregistrement refusé." },
          };
        }
      }
      return {
        ...state,
        events: [action.event, ...state.events],
        lastSyncAt: nowISO(),
        toast: { kind: "success", text: "Événement ajouté à la timeline." },
      };
    }
    case "sendMessage": {
      const body = action.message.body.trim();
      if (!body) {
        return { ...state, toast: { kind: "error", text: "Le message est vide." } };
      }
      if (body.length > MAX_MESSAGE_LENGTH) {
        return {
          ...state,
          toast: { kind: "error", text: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères).` },
        };
      }
      return {
        ...state,
        messages: [{ ...action.message, body }, ...state.messages],
        lastSyncAt: nowISO(),
        toast: {
          kind: "success",
          text: "Message envoyé à l'équipe. Une notification email leur est adressée.",
        },
      };
    }
    case "setMessageStatus":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, status: action.status } : m,
        ),
      };
    case "toast":
      return { ...state, toast: action.toast };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function initialState(): State {
  return {
    currentUserId: null,
    events: seedEvents(),
    messages: seedMessages(),
    lastSyncAt: nowISO(),
    toast: null,
  };
}

interface AppContextValue extends State {
  currentUser: Profile | null;
  login: (userId: string) => void;
  logout: () => void;
  addEvent: (event: DayEvent) => void;
  sendMessage: (message: Message) => void;
  setMessageStatus: (id: string, status: MessageStatus) => void;
  showToast: (toast: State["toast"]) => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const value = useMemo<AppContextValue>(() => {
    const currentUser =
      ALL_PROFILES.find((p) => p.id === state.currentUserId) ?? null;
    return {
      ...state,
      currentUser,
      login: (userId) => dispatch({ type: "login", userId }),
      logout: () => dispatch({ type: "logout" }),
      addEvent: (event) => dispatch({ type: "addEvent", event }),
      sendMessage: (message) => dispatch({ type: "sendMessage", message }),
      setMessageStatus: (id, status) =>
        dispatch({ type: "setMessageStatus", id, status }),
      showToast: (toast) => dispatch({ type: "toast", toast }),
      dismissToast: () => dispatch({ type: "toast", toast: null }),
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppStateProvider>");
  return ctx;
}

export { MAX_MESSAGE_LENGTH };
