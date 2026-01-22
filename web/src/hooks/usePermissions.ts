import { useContext, useMemo } from "react";
import UserContext from "@/lib/userContext";

const usePermissions = <T extends readonly string[]>(permissions: T) => {
	const { my_access_level, hydrated } = useContext(UserContext);

	return useMemo(() => {
		if (!hydrated || !Array.isArray(my_access_level)) {
			return permissions.reduce(
				(acc, perm) => {
					acc[perm] = false;
					return acc;
				},
				{} as Record<T[number], boolean>
			);
		}

		const userPerms = new Set(my_access_level.map(p => p.trim()));
		return permissions.reduce((acc, perm) => {
			acc[perm] = userPerms.has(perm);
			return acc;
		}, {} as Record<T[number], boolean>);
	}, [hydrated, my_access_level, permissions]);
};

export default usePermissions;
