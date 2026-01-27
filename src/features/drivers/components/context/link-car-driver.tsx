import { carSchema } from "@/features/cars/schema";
import { createContext, ReactNode, useState } from "react";
import z from "zod";


export interface ILinkCarDriver {
    modele: string;
    marque: string;
    immatriculation: string;
    id: string;
}

type TCarSchema = z.infer<typeof carSchema>

interface ILinkCarDriverList {

    list: ILinkCarDriver[];
    cars: TCarSchema[]
    addToList?: (linkcardriver: ILinkCarDriver) => void;
    removeToList?: (id: string) => void;
    processItem: ILinkCarDriver | null;
    clearList?: () => void;
    initCars?: (cars: TCarSchema[]) => void;
    setProcessItem?: (linkcardriver: ILinkCarDriver | null) => void;

}

export const LinkCarDriverContext = createContext<ILinkCarDriverList>({
    list: [],
    processItem: null,
    cars: []
})

export const LinkCarDriverProvider = ({ children }: { children: ReactNode }) => {

    const [list, setList] = useState<ILinkCarDriver[]>([]);
    const [processItem, setProcessItem] = useState<ILinkCarDriver | null>(null);
    const [cars, setCars] = useState<TCarSchema[]>([])

    const addToList = (linkcardriver: ILinkCarDriver) => {
        setList([...list, linkcardriver])
    }
    const removeToList = (id: string) => {
        const newList = list.filter((value) => value.id !== id)

        setList(newList)
    }

    const clearList = () => {
        setList([])
    }



    return <LinkCarDriverContext.Provider value={{
        list: list, processItem: processItem, addToList, removeToList, cars, initCars: (cars: TCarSchema[]) => {
            setCars(cars)
        }, clearList, setProcessItem: (item: ILinkCarDriver | null) => {
            setProcessItem(item)
        }
    }}>{children}</LinkCarDriverContext.Provider>
}