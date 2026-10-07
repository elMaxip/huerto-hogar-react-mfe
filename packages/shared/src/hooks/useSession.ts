import { useMemo, useSyncExternalStore } from "react";
import { parseSession, sessionChannel } from "../services/session";

export function useSession() {
  const saved = useSyncExternalStore(
    sessionChannel.subscribe,
    sessionChannel.read,
  );

  return useMemo(() => parseSession(saved), [saved]);
}
