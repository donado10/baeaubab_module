"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import type { JobDigital } from "@/features/server/job/interface";

type ActiveJobsResponse = {
	results: JobDigital[];
};

const useGetActiveJobs = () => {
	return useQuery<ActiveJobsResponse>({
		queryKey: ["get-active-jobs"],
		refetchInterval: 5000,
		queryFn: async () => {
			const response = await client.api.job.active.$get();

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des jobs actifs");
			}

			return (await response.json()) as ActiveJobsResponse;
		},
	});
};

export default useGetActiveJobs;
