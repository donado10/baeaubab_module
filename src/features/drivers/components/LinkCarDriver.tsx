import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import React, { useContext, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCarByMarqueID, useGetMarqueCar } from '@/features/cars/api/use-get-marque-car';
import { LinkCarDriverContext } from './context/link-car-driver';
import { Button } from '@/components/ui/button';

const SelectModelContainer = () => {
  const linkCarDriverCtx = useContext(LinkCarDriverContext)
  const { data, isPending } = useGetCarByMarqueID(linkCarDriverCtx.processItem?.marque ?? '')


  useEffect(() => {
    if (!isPending) {

      linkCarDriverCtx.initCars!(data.result)
    }
  }, [isPending])
  if (isPending) {
    return <SelectModel items={[]} p_disabled />
  }

  if (!linkCarDriverCtx.processItem?.marque) {
    return <SelectModel items={[]} p_disabled />
  }

  if (data?.result && data?.result.length <= 0) {
    return <SelectModel items={[]} p_disabled />
  }




  return <><SelectModel onAction={(value: string) => { linkCarDriverCtx.setProcessItem!({ ...linkCarDriverCtx.processItem!, modele: value }) }} items={data?.result.map((d) => { return ({ value: d.car_addons.modele, label: d.car_addons.modele }) }) ?? []} p_disabled={data.result.length <= 0} /></>
}

function SelectModel({
  items,
  onAction,
  p_disabled
}: {
  items: { value: string; label: string }[];
  onAction?: (value: string) => void;
  p_disabled: boolean
}) {
  return (
    <div className='flex-col flex gap-2 w-1/2'>
      <span>Modèle</span>
      <Select onValueChange={(value) => onAction!(value)} >
        <SelectTrigger className="w-full bg-white" disabled={p_disabled}>
          <SelectValue className=" border-none" placeholder="Modèle" />
        </SelectTrigger>
        <SelectContent className=' '>
          <SelectGroup>
            <SelectLabel>Modele</SelectLabel>
            {items.map((item, i) => (<SelectItem key={item.value + i} value={item.value}>{item.label}</SelectItem>))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
const SelectMarqueContainer = () => {
  const { data, isPending } = useGetMarqueCar()
  const LinkCarDriverCtx = useContext(LinkCarDriverContext)

  if (isPending) {
    return <SelectMarque items={[]} />
  }

  if (data?.result && data?.result.length <= 0) {
    return <SelectMarque items={[]} />
  }
  return <><SelectMarque onAction={(value: string) => { LinkCarDriverCtx.setProcessItem!({ id: "", immatriculation: "", modele: "", marque: value }) }} items={data?.result.map((d) => { return ({ value: d.car_marque, label: d.car_marque }) }) ?? []} /> </>
}

function SelectMarque({
  items,
  onAction,
}: {
  items: { value: string; label: string }[];
  onAction?: (value: string) => void;
}) {
  return (
    <div className='flex-col flex gap-2 w-1/2'>
      <span>Marque</span>
      <Select onValueChange={(value) => { onAction && onAction(value) }} >
        <SelectTrigger className="w-full bg-white">
          <SelectValue className=" border-none" placeholder="Marque" />
        </SelectTrigger>
        <SelectContent className=' '>
          <SelectGroup>
            <SelectLabel>Modele</SelectLabel>
            {items.length > 0 &&
              items.map((item, i) =>
                (<SelectItem key={item.value + i} value={item.value}>{item.label}</SelectItem>))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
const SelectNumeroImmatriculationContainer = () => {
  const linkCarDriverCtx = useContext(LinkCarDriverContext)


  return <><SelectNumeroImmatriculation onAction={(value: string, id: string) => { linkCarDriverCtx.setProcessItem!({ ...linkCarDriverCtx.processItem!, immatriculation: value, id }) }} items={linkCarDriverCtx.cars.map((car) => { return { value: car.car_addons.matricule, label: car.car_addons.matricule, id: car.car_no } })} p_disabled={!linkCarDriverCtx.processItem?.modele} /></>
}

function SelectNumeroImmatriculation({
  items,
  onAction,
  p_disabled
}: {
  items: { value: string; label: string; id: string }[];
  onAction?: (value: string, id: string) => void;
  p_disabled: boolean;
}) {
  return (
    <div className='flex-col flex gap-2 w-full'>
      <span>Numéro d'immatriculation</span>
      <Select onValueChange={(value) => {
        const item = items.filter((car) => value === car.id)[0]

        onAction!(item.value, value)
      }} >
        <SelectTrigger className="w-full bg-white" disabled={p_disabled}>
          <SelectValue className=" border-none" placeholder="Immatriculation" />
        </SelectTrigger>
        <SelectContent className=' '>
          <SelectGroup>
            <SelectLabel>Immatriculation</SelectLabel>

            {items.map((item) => (
              <SelectItem key={item.value} value={item.id}>
                {item.label}</SelectItem>))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}





const LinkCarDriver = ({ onDialogClose }: { onDialogClose: () => void }) => {
  const linkCarDriverCtx = useContext(LinkCarDriverContext)
  return (
    <Card className='bg-transparent   shadow-none'>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-6'>
          <SelectMarqueContainer />
          <SelectModelContainer />
        </div>
        <div className='w-full'><SelectNumeroImmatriculationContainer /></div>
      </CardContent>
      <CardFooter className='flex flex-row ml-auto gap-4'>
        <Button variant={"destructive"} onClick={onDialogClose}>Annuler</Button>
        <Button variant={"default"} onClick={() => {
          if (linkCarDriverCtx.processItem) {

            linkCarDriverCtx.addToList!(linkCarDriverCtx.processItem)
            onDialogClose()
          }
        }}
          className='bg-green-600' disabled={linkCarDriverCtx.processItem?.immatriculation && linkCarDriverCtx.processItem?.marque && linkCarDriverCtx.processItem?.modele ? false : true}>Ajouter</Button>
      </CardFooter>
    </Card>
  )
}

const LinkCarDriverContainer = ({ onDialogClose }: { onDialogClose: () => void }) => {

  return <LinkCarDriver onDialogClose={onDialogClose} />
}

export default LinkCarDriverContainer