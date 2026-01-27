import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "./ui/card";

export const CardStatus = ({
    title,
    value,
    color,
}: {
    title: string;
    value: string;
    color: string;
}) => {
    return (
        <Card className="relative bg-secondary p-2 flex gap-0 flex-col border-none   w-1/3">
            <span
                className={cn("rounded-full w-6 h-6 absolute  top-2 right-2  ", color)}
            ></span>
            <CardTitle className="mb-4">{title}</CardTitle>
            <CardContent className=" p-0">
                <span className="font-bold text-primary text-xl">{value}</span>
            </CardContent>
        </Card>
    );
};