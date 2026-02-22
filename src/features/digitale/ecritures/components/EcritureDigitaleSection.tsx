"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn, getFrenchMonthName } from '@/lib/utils'
import TableEcritureDigitalContainer from './TableContainer'
import { DialogLoadEcritures } from './DialogLoadEcritures'
import { EStatus, useEcritureEnteteLigneStore } from '../store/store'
import { DialogLoadEcrituresWithCheck } from './DialogLoadEcrituresWithCheck'
import { Card } from '@/components/ui/card'
import { DialogRecheckEcritures } from './DialogRecheckEcritures'
import { Input } from '@/components/ui/input'
import { IoFilter } from "react-icons/io5";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PopoverFilterButton } from './FilterSection'


const InvalideButtonContainer = () => {
    const store = useEcritureEnteteLigneStore()
    return <>
        {store.billCart.length > 0 && <DialogRecheckEcritures>
            <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Revérifier Ecritures</Button>
        </DialogRecheckEcritures>}
    </>
}
const AttenteButtonContainer = () => {
    const store = useEcritureEnteteLigneStore()
    console.log(store.billCart

    )
    return <>
        {store.billCart.length > 0 && <DialogRecheckEcritures>
            <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Vérifier Ecritures</Button>
        </DialogRecheckEcritures>}
    </>
}

const ResumeCard = ({ title, count }: { title: string, count: number }) => {
    return <Card className='shadow-none p-4 gap-4'>
        <h1 className='text-base font-normal text-gray-700'>{title}</h1>
        <h2 className='font-bold text-3xl italic '>{count}</h2>
    </Card>
}

const SelectType = ({ onSetType, disabled }: { onSetType: (value: 'tiers' | 'facture') => void, disabled: boolean }) => {
    const [itemValue, setItemValue] = useState<'tiers' | 'facture'>('facture')

    return <Select disabled={disabled} value={itemValue} onValueChange={(value) => { onSetType(value as 'tiers' | 'facture'); setItemValue(value as 'tiers' | 'facture') }}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="type" />
        </SelectTrigger>
        <SelectContent >
            <SelectGroup>
                <SelectItem key={"tiers"} value={"tiers"}>Compte Tiers</SelectItem>
                <SelectItem key={"facture"} value={"facture"}>Facture</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
}

const Search = () => {
    const store = useEcritureEnteteLigneStore()
    return <div className='flex items-center gap-4'>
        <Input disabled={store.items.length <= 0} onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-64' placeholder='Rechercher' />
        <SelectType disabled={store.items.length <= 0} onSetType={(value: 'tiers' | 'facture') => {

            store.setFilter({ ...store.filter, search: { ...store.filter.search, type: value } })
        }} />
    </div>
}

const FilterSection = () => {
    const store = useEcritureEnteteLigneStore()
    const classNameButton = 'p-0 hover:bg-transparent hover:text-blue-600  rounded-none'



    return <div className='border-b border-gray-200 flex items-center justify-between  gap-8 p-2'>

        <div className=' border-gray-200 flex items-center gap-8'>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.ALL ? 'text-blue-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.ALL })} disabled={store.items.length <= 0}>Tout</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.INTEGRE ? 'text-blue-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.INTEGRE })} disabled={store.items.length <= 0}>Intégré</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.VALIDE ? 'text-blue-600 font-semibold  text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.VALIDE })} disabled={store.items.length <= 0}>Valide</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.INVALIDE ? 'text-blue-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.INVALIDE })} disabled={store.items.length <= 0}>Invalide</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.ATTENTE ? 'text-blue-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.ATTENTE })} disabled={store.items.length <= 0}>En attente</Button>
        </div>
        <div className='flex items-center gap-4'>
            <div className='border-r pr-2'>
                <Search />
            </div>
            <div>
                <PopoverFilterButton>

                    <Button>
                        <span><IoFilter />
                        </span>
                        Filtre</Button>
                </PopoverFilterButton>
            </div>
        </div>
    </div>
}

const EcritureDigitaleSection = () => {

    const [dialogEcWithCheck, setDialogEcWithCheck] = useState(false)

    const store = useEcritureEnteteLigneStore()

    useEffect(() => {
        if (store.event?.status === 'done') {
            setDialogEcWithCheck(true)
        }
    }, [store.event?.status])


    return (
        <section className='p-4 text-gray-700'>
            {store.event?.status === 'done' && <DialogLoadEcrituresWithCheck open={dialogEcWithCheck} onOpen={setDialogEcWithCheck} />}

            <div className='flex items-center justify-between mb-8 '>
                <div>

                    <h1 className='text-2xl text-[#101010] font-bold'>Ecritures Digitales</h1>
                    {store.periode.length > 0 && <h2 className='text-xs'>{getFrenchMonthName(Number(store.periode[1]))} {store.periode[0]}</h2>}
                </div>
                <div className='flex items-center gap-4'>

                    {store.filter && store.filter.status === EStatus.ATTENTE && <AttenteButtonContainer />}
                    {store.filter && store.filter.status === EStatus.INVALIDE && <InvalideButtonContainer />}
                    {store.filter && store.filter.status === EStatus.VALIDE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Intégrer Ecritures</Button>}
                    {store.filter && store.filter.status === EStatus.INTEGRE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Annuler Ecritures</Button>}
                    <DialogLoadEcritures >

                        <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Charger Ecritures</Button>
                    </DialogLoadEcritures>
                </div>
            </div>
            <div>
                {/*                 {store.event?.jobId && <JobWatcher jobId={store.event.jobId} />}
 */}            </div>
            <div className='h-32 mb-4 shadow-none grid grid-cols-5 gap-4 '>
                <ResumeCard title='Total Factures' count={store.items.length} />
                <ResumeCard title='Factures Intégrées' count={store.items.filter((item) => item.entete.Status === 3).length} />
                <ResumeCard title='Factures Valides' count={store.items.filter((item) => item.entete.Status === 2).length} />
                <ResumeCard title='Factures Invalides' count={store.items.filter((item) => item.entete.Status === 1).length} />
                <ResumeCard title='Factures en attente' count={store.items.filter((item) => item.entete.Status === 0).length} />
            </div>
            <Card className='p-4 shadow-none'>
                <FilterSection />
                <div>
                    <TableEcritureDigitalContainer />
                </div>
            </Card>
        </section>
    )
}

export default EcritureDigitaleSection