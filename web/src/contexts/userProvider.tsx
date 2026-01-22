import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {toast} from "react-toastify";
import UserContext from "@/lib/userContext";
import { jwtDecode } from "jwt-decode";
import { User, TokenRemember } from "@/lib/types";
import {http} from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";

export default function UserProvider({ children }: PropsWithChildren) {
	const initToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

	const [auth, setAuth] = useState<boolean>(!!initToken);
	const [token, setToken] = useState<string | null>(initToken);
	const [my_id, setMyID] = useState<string | null>(null);
	const [my_details, setMyDetails] = useState<User | null>(null);
	const [my_access_level, setMyAccessLevel] = useState(null);

	const [hydrated, setHydrated] = useState<boolean>(false);
	const [detailsReady, setDetailsReady] = useState<boolean>(false);

	useEffect(() => {
		if (token) {
			try {
				const decoded: any = jwtDecode(token);
				if (decoded && decoded.id) {
					setMyID(String(decoded.id));
					fetchUser()
				}
			} catch {}
			setAuth(true);
		} else {
			setAuth(false);
			setMyID(null);
			setMyDetails(null);
			setDetailsReady(true);
		}
		setHydrated(true);
	}, []);

	const fetchUser = async () => {
		try {
		const res:any = await http.get("/get-profile/");
		const resp: ApiResp = res.data;
		if (resp.error === false && resp.data) {
			setMyDetails(resp.data.profile);
			setMyAccessLevel(resp.data.permissions);
			setDetailsReady(true);
		}
		} catch (error) {
			toast.error("Session expired, logging Out");
			if(error?.status === 401 || error?.response?.status === 401) logout();
			// console.log(error?.status);
		} finally {
			setDetailsReady(true);
		}
	};

	useEffect(() => {
		const remember = localStorage.getItem("remember");
		const storedToken = remember === "1" 
			? localStorage.getItem("token")
			: sessionStorage.getItem("token");
		
		if (storedToken) login({ token: storedToken, remember: remember === "1" });
	}, []);

	useEffect(() => {
		const remember = localStorage.getItem("remember") === "1";
		
		if (token) {
			if (remember) {
				localStorage.setItem("token", token);
				sessionStorage.removeItem("token");
			} else {
				sessionStorage.setItem("token", token);
				localStorage.removeItem("token");
			}
		} else {
			localStorage.removeItem("token");
			sessionStorage.removeItem("token");
		}
	}, [token]);

	const login = async (tokenRemember: TokenRemember) => {
		const { token, remember } = tokenRemember;
		try {
			const decoded: any = await jwtDecode(token);
			if (decoded && decoded.id) {
				setAuth(true);
				setToken(token);
				setMyID(decoded.id);
				localStorage.setItem("remember", remember ? "1" : "0");
				
				if (remember) {
					localStorage.setItem("token", token);
					sessionStorage.removeItem("token");
				} else {
					sessionStorage.setItem("token", token);
					localStorage.removeItem("token");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const logout = () => {
		setToken(null);
		setAuth(false);
		setMyID(null);
		setMyDetails(null);
		localStorage.removeItem("token");
		localStorage.removeItem("remember");
		sessionStorage.removeItem("token");
		window.location.href = "/";
	};

	const value = useMemo(
		() => ({ auth, token, my_id, my_details, my_access_level, hydrated, detailsReady, setAuth, setToken, setMyID, setMyDetails, setMyAccessLevel, login, logout, setHydrated, setDetailsReady }),
		[auth, token, my_id, my_details, my_access_level, hydrated, detailsReady]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;

}