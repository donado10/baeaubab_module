"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";

type DialogShellProps = {
    /** Trigger element. Omit when using controlled mode (open prop). */
    children?: ReactNode;
    title: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isPending?: boolean;
    /** Optional body content rendered between the header and footer. */
    content?: ReactNode;
    /** Optional description shown below the title. */
    description?: string;
    /** Controlled open state. When provided, the dialog is fully controlled. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function DialogShell({
    children,
    title,
    onConfirm,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    isPending = false,
    content,
    description,
    open: controlledOpen,
    onOpenChange,
}: DialogShellProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = (val: boolean) => {
        if (!isControlled) setInternalOpen(val);
        onOpenChange?.(val);
    };

    const submitHandler = () => {
        setOpen(false);
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-4">
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                {content}
                <DialogFooter className="gap-4">
                    <DialogClose asChild>
                        <Button variant="outline">{cancelLabel}</Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={submitHandler}
                        disabled={isPending}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
