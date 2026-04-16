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
    // Tracks which module each open SSE connection belongs to, so we can
    // still invalidate data queries when a job finishes between polls.
    const moduleByJobId = useRef<Map<string, JobModule>>(new Map());

    useEffect(() => {
        const jobs = data?.results ?? [];
        const activeJobIds = new Set(jobs.map((j) => j.Job_Id));

        // Close SSE connections for jobs no longer active
        const staleJobIds: string[] = [];
        for (const [jobId] of sourcesRef.current) {
            if (!activeJobIds.has(jobId)) {
                staleJobIds.push(jobId);
            }
        }

        let hadStaleFastJobs = false;
        for (const jobId of staleJobIds) {
            sourcesRef.current.get(jobId)?.close();
            sourcesRef.current.delete(jobId);

            // The job disappeared without us receiving a "done" SSE event
            // (fast job finished between polls). Fire module invalidations now.
            const module = moduleByJobId.current.get(jobId);
            if (module) {
                const keys = MODULE_QUERY_KEYS[module] ?? [];
                for (const key of keys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
                queryClient.invalidateQueries({ queryKey: ["get-jobs"] });
                moduleByJobId.current.delete(jobId);
                hadStaleFastJobs = true;
            }
        }

        // If we had fast-finishing jobs, schedule one more active-jobs poll
        // so any new pending job that arrived in the same window gets picked up.
        if (hadStaleFastJobs) {
            queryClient.invalidateQueries({ queryKey: ["get-active-jobs"] });
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
                    if (payload.status === "done" || payload.status === "failed") {
                        const keys = MODULE_QUERY_KEYS[job.Job_Module] ?? [];
                        for (const key of keys) {
                            queryClient.invalidateQueries({ queryKey: key });
                        }
                        moduleByJobId.current.delete(job.Job_Id);
                    }
                } catch { /* ignore parse errors */ }
            });

            es.onerror = () => {
                es.close();
                sourcesRef.current.delete(job.Job_Id);
                moduleByJobId.current.delete(job.Job_Id);
            };

            moduleByJobId.current.set(job.Job_Id, job.Job_Module);
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
            moduleByJobId.current.clear();
        };
    }, []);

    return null;
}
