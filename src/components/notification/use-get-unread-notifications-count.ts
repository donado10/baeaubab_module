"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type UnreadNotificationsCountResponse = {
	unreadCount: number;
};

const useGetUnreadNotificationsCount = () => {
	const query = useQuery<UnreadNotificationsCountResponse>({
		queryKey: ["get-unread-notification-count"],
		refetchInterval: 5000,
		queryFn: async () => {
			const response = await client.api.notification["count-unread"].$get();

			if (!response.ok) {
				throw new Error("error when fetching unread notification count");
			}

			return (await response.json()) as UnreadNotificationsCountResponse;
		},
	});

	return query;
};

export default useGetUnreadNotificationsCount;
