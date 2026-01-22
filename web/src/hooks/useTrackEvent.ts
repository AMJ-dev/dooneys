import { useContext, useCallback } from "react";
import { http } from "@/lib/httpClient";
import UserContext from "@/lib/userContext";

type TrackEventPayload = {
  event: string;
  entity_id?: number;
  value?: number;
  metadata?: Record<string, any>;
};

export const useTrackEvent = () => {
  const { auth } = useContext(UserContext);

  return useCallback(
    async (payload: TrackEventPayload) => {
      try {
        await http.post("/track-event/", {
          ...payload,
          auth: !!auth
        });
      } catch (error) {
        console.error(error);
      }
    },
    [auth]
  );
};
