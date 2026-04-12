import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { INotificationSchema } from "@/features/server/notification/interface";

type NotificationResponse = {
	results: INotificationSchema[];
};

type UseGetNotificationsOptions = {
	refetchInterval?: number;
};

const useGetNotifications = ({ refetchInterval }: UseGetNotificationsOptions = {}) => {
	const query = useQuery<NotificationResponse>({
		queryKey: ["get-notification"],
		refetchInterval,
		queryFn: async () => {
			const response = await client.api["notification"].$get();

			if (!response.ok) {
				throw new Error("error when fetching piece");
			}

			return (await response.json()) as NotificationResponse;
		},
	});

	return query;
};

export default useGetNotifications;
