"use client"

import { ReactNode } from "react";
import { toast } from "sonner";
import useUpdateBonLivraisonOneEntreprise from "../../api/use-update-bon-livraison-one-entreprise";
import { DialogBonLivraisonAction } from "./dialog-shell";

type Props = {
    children?: ReactNode;
    blId: string;
    entrepriseId: string;
    year: string;
    month: string;
    onSuccess?: () => void;
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
    onSuccess,
    title = "Actualiser Bon de livraison",
    open,
    onOpenChange,
}: Props) {
    const { mutate, isPending } = useUpdateBonLivraisonOneEntreprise();

    const submitHandler = () => {
        mutate(
            { json: { bl_id: blId, entreprise_id: entrepriseId, year, month } },
            {
                onSuccess: () => {
                    toast.success("Actualisation lancée")
                    onSuccess?.()
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