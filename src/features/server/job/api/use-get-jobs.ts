"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import type { JobDigital } from "@/features/server/job/interface";

type JobsResponse = {
	results: JobDigital[];
};

const useGetJobs = () => {
	return useQuery<JobsResponse>({
		queryKey: ["get-jobs"],
		queryFn: async () => {
			const response = await client.api.job.$get();

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des jobs");
			}

			return (await response.json()) as JobsResponse;
		},
	});
};

export default useGetJobs;
