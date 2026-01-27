import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import useGetAvailableCar from "@/features/drivers/api/use-get-available-car"
import useGetAvailableDriver from "@/features/drivers/api/use-get-available-drive"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import useAffectationMission from "../api/use-affectation-mission"
import { CollapsibleFilterDriver, CollapsibleFilterVehicule } from "./CollapsibleFilter"


const SelectAvailableCarContainer = ({ carFilter, defaultCar, onSetCar }: { carFilter: string[], defaultCar?: string, onSetCar: (value: string | null) => void }) => {
    const { data, isPending } = useGetAvailableCar(carFilter)

    if (isPending) {
        return <SelectAvailableCar items={[]} />
    }

    if (data?.result && data?.result.length <= 0) {
        return <SelectAvailableCar items={[]} />
    }

    const dataFilter = carFilter.length > 0 ? data.result.filter((car) => carFilter.includes(car.car_addons.status)) ?? [] : data.result

    return <><SelectAvailableCar defaultCar={defaultCar} onAction={(value: string | null) => { onSetCar(value) }} items={dataFilter.map((d) => { return ({ value: d.car_no, label: d.car_addons.marque + ' ' + d.car_addons.modele + ' ' + d.car_addons.year }) }) ?? []} /> </>
}

function SelectAvailableCar({
    items,
    onAction,
    defaultCar
}: {
    items: { value: string; label: string }[];
    onAction?: (value: string) => void;
    defaultCar?: string
}) {

    useEffect(() => {
        if (defaultCar && onAction) {

            onAction(defaultCar)
        }
    }, [defaultCar])

    return (
        <div className='flex-col flex gap-2 w-full'>
            <span>Véhicules</span>
            <Select defaultValue={defaultCar} onValueChange={(value) => { onAction && onAction(value) }} >
                <SelectTrigger className="w-full bg-white">
                    <SelectValue className=" border-none" placeholder="Véhicules" />
                </SelectTrigger>
                <SelectContent className=' '>
                    <SelectGroup>
                        <SelectLabel>Véhicules</SelectLabel>
                        {items.length > 0 &&
                            items.map((item, i) =>
                                (<SelectItem key={item.value + i} value={item.value}>{item.label}</SelectItem>))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}



const SelectAvailableDriverContainer = ({ defaultDriver, onSetDriver, driverFilter }: { driverFilter: string[], defaultDriver?: string, onSetDriver: (value: string | null) => void }) => {
    const { data, isPending } = useGetAvailableDriver(driverFilter)

    if (isPending) {
        return <SelectAvailableDriver items={[]} />
    }

    if (data?.result && data?.result.length <= 0) {
        return <SelectAvailableDriver items={[]} />
    }

    const dataFilter = driverFilter.length > 0 ? data.result.filter((driver) => driverFilter.includes(driver.em_addons.status)) ?? [] : data.result


    return <><SelectAvailableDriver defaultDriver={defaultDriver} onAction={(value: string | null) => { onSetDriver(value) }} items={dataFilter.map((d) => { return ({ value: d.em_no, label: d.em_firstname + ' ' + d.em_lastname }) }) ?? []} /> </>
}

function SelectAvailableDriver({
    items,
    onAction,
    defaultDriver
}: {
    items: { value: string; label: string }[];
    onAction?: (value: string) => void;
    defaultDriver?: string
}) {

    useEffect(() => {
        if (defaultDriver && onAction) {

            onAction(defaultDriver)
        }
    }, [defaultDriver])

    return (
        <div className='flex-col flex gap-2 w-full'>
            <span>Chauffeurs</span>
            <Select defaultValue={defaultDriver} onValueChange={(value) => { onAction && onAction(value) }} >
                <SelectTrigger className="w-full bg-white">
                    <SelectValue defaultValue={defaultDriver} className=" border-none" placeholder="Chauffeurs" />
                </SelectTrigger>
                <SelectContent className=' '>
                    <SelectGroup>
                        <SelectLabel>Chauffeurs</SelectLabel>
                        {items.length > 0 &&
                            items.map((item, i) =>
                                (<SelectItem key={item.value + i} value={item.value}>{item.label}</SelectItem>))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}



export function SheetAffectationMission({ defaultValue, children }: { children: ReactNode, defaultValue?: { car: string; driver: string } }) {
    const [driver, setDriver] = useState<string | null>()
    const [car, setCar] = useState<string | null>()
    const pathname = usePathname()
    const { mutate } = useAffectationMission()
    const [open, setOpen] = useState<boolean | undefined>(undefined)

    const [carFilter, setCarFilter] = useState<string[]>([])
    const [driverFilter, setDriverFilter] = useState<string[]>([])


    return (
        <Sheet open={open} onOpenChange={() => setOpen(undefined)}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side={"right"} className="max-w-2xl bg-white">
                <SheetHeader>
                    <SheetTitle>Affectation Mission</SheetTitle>
                </SheetHeader>
                <div>


                </div>

                <div className="grid flex-1 auto-rows-min gap-1 ">
                    <div className="flex flex-col gap-2 border-b pb-4">

                        <div className="">

                            <CollapsibleFilterDriver filter={(action, value) => {
                                if (action === 'add') {
                                    setDriverFilter([...driverFilter, value!])
                                } else {
                                    setDriverFilter([...driverFilter.filter((driver) => driver !== value)])

                                }
                            }} />
                        </div>
                        <div className="px-4">

                            <SelectAvailableDriverContainer driverFilter={driverFilter} defaultDriver={defaultValue?.driver} onSetDriver={(value: string | null) => setDriver(value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2  pb-4">
                        <div>

                            <CollapsibleFilterVehicule filter={(action, value) => {
                                if (action === 'add') {
                                    setCarFilter([...carFilter, value!])
                                } else {
                                    setCarFilter([...carFilter.filter((car) => car !== value)])

                                }
                            }} />
                        </div>
                        <div className="px-4">
                            <SelectAvailableCarContainer carFilter={carFilter} defaultCar={defaultValue?.car} onSetCar={(value: string | null) => setCar(value)} />
                        </div>
                    </div>

                </div>
                <SheetFooter>
                    <Button type="submit" onClick={() => {
                        const miss_no = pathname.split('/').at(-1)
                        if (car && driver && miss_no) {
                            mutate({
                                json: {
                                    miss_no: miss_no,
                                    miss_car: car,
                                    miss_driver: driver
                                }
                            }, {
                                onSuccess: () => {

                                    setOpen(false)
                                }
                            })

                        }
                    }}>Confirmer</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Fermer</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
