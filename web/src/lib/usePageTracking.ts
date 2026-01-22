import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import {http} from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import userContext from "@/lib/userContext";

export const usePageTracking = () => {
  const location = useLocation();
  const { auth } = useContext(userContext);

  useEffect(() => {
    (async () => {
        try {
            const form_data = new FormData();
            form_data.append("url", location.pathname + location.search);
            form_data.append("referrer", document.referrer || null);
            if(auth) form_data.append("auth", "1");
            await http.post("/track-visitors/", form_data);
        } catch (error) {
            console.error(error);
        }
    })();

  }, [location]);
};
