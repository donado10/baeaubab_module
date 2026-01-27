import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import GearIcon from "@/assets/gear.svg";
import Image from "next/image";

export function DropdownHeaderMenuSection({ items }: { items: { link: string, label: string }[] }) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button
                className=" border-2 border-primary hover:bg-primary hover:text-white flex items-center justify-between"
                variant={"outline"}

            >
                <span>
                    <Image
                        src={GearIcon}
                        alt=""
                        width={24}
                        height={24}
                        className=""
                    />
                </span>
                <span>Actions</span>
            </Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                {items.map((item, i) => {
                    return <DropdownMenuItem key={item.label + i} className="text-blue-600" asChild>
                        <Link href={item.link}>{item.label}</Link>
                    </DropdownMenuItem>
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
