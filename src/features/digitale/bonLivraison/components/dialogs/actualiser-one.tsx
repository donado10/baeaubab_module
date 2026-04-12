"use client"

import { ReactNode } from "react";
import { toast } from "sonner";
import useUpdateBonLivraisonOneEntreprise from "../../api/use-update-bon-livraison-one-entreprise";
import { DialogBonLivraisonAction } from "./dialog-shell";

type JobEvent = {
    ec_count: string;
    ec_total: string;
    jobId: string;
    status: string;
    id_toast_job: string;
};

type Props = {
    children?: ReactNode;
    blId: string;
    entrepriseId: string;
    year: string;
    month: string;
    setEvent: (event: JobEvent) => void;
    renderToast: () => ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function DialogActualiserOneEntrepriseBonLivraison({
    children,
    blId,
    entrepriseId,
    year,
    month,
    setEvent,
    renderToast,
    title = "Actualiser Bon de livraison",
    open,
    onOpenChange,
}: Props) {
    const { mutate, isPending } = useUpdateBonLivraisonOneEntreprise();

    const submitHandler = () => {
        mutate(
            { json: { bl_id: blId, entreprise_id: entrepriseId, year, month } },
            {
                onSuccess: (results: any) => {
                    const id_toast = toast(renderToast, {
                        duration: Infinity,
                        style: { background: "green" },
                    });
                    setEvent({
                        ec_count: "",
                        ec_total: "",
                        jobId: results.jobId,
                        status: "pending",
                        id_toast_job: id_toast as string,
                    });
                },
                onError: (error) => toast.error(error.message),
            }
        );
    };

    return (
        <DialogBonLivraisonAction
            title={title}
            onConfirm={submitHandler}
            isPending={isPending}
            open={open}
            onOpenChange={onOpenChange}
        >
            {children}
        </DialogBonLivraisonAction>
    );
}