"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useGetActiveJobs from "@/features/server/job/api/use-get-active-jobs";
import type { JobModule } from "@/features/server/job/interface";

const MODULE_SSE_MAP: Record<JobModule, string> = {
    ecritures: "/api/digitale/ecritures/events",
    bonLivraison: "/api/digitale/bonLivraison/events/jobId",
    facture: "/api/digitale/facture/events/jobId",
};

/** Query key prefixes to invalidate when a module job completes. */
const MODULE_QUERY_KEYS: Record<JobModule, string[][]> = {
    ecritures: [],
    bonLivraison: [
        ["get-bon-livraison-stats-by-company"],
        ["get-bon-livraison-stats"],
        ["entreprise_bls"],
        ["entreprise_factures"],
    ],
    facture: [
        ["get-facture-stats-by-company"],
        ["get-facture-stats"],
        ["entreprise_factures"],
        ["get-bon-livraison-stats-by-company"],
        ["get-bon-livraison-stats"],
        ["entreprise_bls"],
    ],
};

export default function ActiveJobWatcher() {
    const { data } = useGetActiveJobs();
    const queryClient = useQueryClient();
    const sourcesRef = useRef<Map<string, EventSource>>(new Map());

    useEffect(() => {
        const jobs = data?.results ?? [];
        const activeJobIds = new Set(jobs.map((j) => j.Job_Id));

        // Close SSE connections for jobs no longer active
        for (const [jobId, es] of sourcesRef.current) {
            if (!activeJobIds.has(jobId)) {
                es.close();
                sourcesRef.current.delete(jobId);
            }
        }

        // Open SSE connections for new active jobs
        for (const job of jobs) {
            if (sourcesRef.current.has(job.Job_Id)) continue;

            const prefix = MODULE_SSE_MAP[job.Job_Module];
            if (!prefix) continue;

            const url = `${process.env.NEXT_PUBLIC_APP_URL!}${prefix}/${job.Job_Id}`;
            const es = new EventSource(url);

            es.addEventListener("job_update", (e) => {
                queryClient.invalidateQueries({ queryKey: ["get-active-jobs"] });
                queryClient.invalidateQueries({ queryKey: ["get-jobs"] });

                // On completion, invalidate module-specific data queries
                try {
                    const payload = JSON.parse((e as MessageEvent).data);
                    if (payload.status === "done") {
                        const keys = MODULE_QUERY_KEYS[job.Job_Module] ?? [];
                        console.log(keys)
                        for (const prefix of keys) {
                            queryClient.invalidateQueries({ queryKey: prefix });
                        }
                    }
                } catch { /* ignore parse errors */ }
            });

            es.onerror = () => {
                es.close();
                sourcesRef.current.delete(job.Job_Id);
            };

            sourcesRef.current.set(job.Job_Id, es);
        }
    }, [data, queryClient]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            for (const es of sourcesRef.current.values()) {
                es.close();
            }
            sourcesRef.current.clear();
        };
    }, []);

    return null;
}
