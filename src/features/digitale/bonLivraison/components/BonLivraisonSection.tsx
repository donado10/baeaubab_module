"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn, getFrenchMonthName } from '@/lib/utils'
import { DialogLoadEcritures } from './DialogLoadEcritures'
import { EStatus, useEntrepriseBonLivraisonStore } from '../store/store'
import { DialogLoadEcrituresWithCheck } from './DialogLoadEcrituresWithCheck'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { IoFilter } from "react-icons/io5";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PopoverFilterButton } from './FilterSection'
import { MdCloudDownload } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import TableBonLivraisonDigitalContainer from './TableContainer'
import useGetBillStats from '../api/use-get-bl-stats'



const ResumeCard = ({ title, count, background, text = 'text-gray-700' }: { title: string, count: number, background: string, text?: string }) => {
    return <Card className={cn('shadow-none p-4 gap-4 flex flex-row items-center justify-between', background)}>
        <div className='flex flex-col gap-4'>

            <h1 className={cn('text-base font-normal ', text)}>{title}</h1>
            <h2 className='font-bold text-3xl italic '>{count}</h2>
        </div>
        <IoDocumentTextOutline width={1600} height={1600} size={40} />
    </Card>
}

const SelectType = ({ onSetType, disabled }: { onSetType: (value: 'entreprise_id' | 'Intitule') => void, disabled: boolean }) => {
    const [itemValue, setItemValue] = useState<'entreprise_id' | 'Intitule'>('Intitule')

    return <Select disabled={disabled} value={itemValue} onValueChange={(value) => { onSetType(value as 'entreprise_id' | 'Intitule'); setItemValue(value as 'entreprise_id' | 'Intitule') }}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="type" />
        </SelectTrigger>
        <SelectContent >
            <SelectGroup>
                <SelectItem key={"entreprise_id"} value={"entreprise_id"}>ID Entreprise</SelectItem>
                <SelectItem key={"Intitule"} value={"Intitule"}>Intitulé</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
}

const Search = () => {
    const store = useEntrepriseBonLivraisonStore()
    return <div className='flex items-center gap-4'>
        <Input disabled={store.items.length <= 0} onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-64' placeholder='Rechercher' />
        <SelectType disabled={store.items.length <= 0} onSetType={(value: 'entreprise_id' | 'Intitule') => {

            store.setFilter({ ...store.filter, search: { ...store.filter.search, type: value } })
        }} />
    </div>
}

const FilterSection = () => {
    const store = useEntrepriseBonLivraisonStore()
    const classNameButton = 'p-0 hover:bg-transparent hover:text-primary/30  rounded-none'



    return <div className='border-b border-gray-200 flex items-center justify-between  gap-8 p-2'>

        <div className=' border-gray-200 flex items-center gap-8'>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.ALL ? 'text-primary font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.ALL })} disabled={store.items.length <= 0}>Tout</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.TAXABLE ? 'text-green-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.TAXABLE })} disabled={store.items.length <= 0}>Taxable</Button>
            <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.EXONORE ? ' text-yellow-600 font-semibold  text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.EXONORE })} disabled={store.items.length <= 0}>Exonoré</Button>
        </div>
        <div className='flex items-center gap-4'>
            <Search />
        </div>
    </div>
}

const FilterResumeCard = ({ value }: { value: string }) => {
    return <span className='border-2 border-red-600 text-xs px-2 py-1 rounded-md text-red-600 font-semibold bg-red-600/20'>{value}</span>
}

const FilterResume = () => {
    const store = useEntrepriseBonLivraisonStore()
    if (store.filter.status !== EStatus.ALL) {
        return <></>
    }
    return <ul className='flex items-center gap-4'>
        {

            store.filter.invalide && store.filter.invalide.map((value) => <li key={value}><FilterResumeCard value={value} /></li>)
        }
        {store.filter.ecart_conformite !== 0 && <li key={'ecart'}><FilterResumeCard value={`ecart: ${store.filter.ecart_conformite}`} /></li>}
    </ul>
}

const FilterResumeContainer = () => {
    const store = useEntrepriseBonLivraisonStore()
    const { data, isPending } = useGetBillStats(store.periode[0], store.periode[1])

    if (isPending) {
        return <>
            <ResumeCard background='bg-primary text-white' text='text-white' title='Total Clients' count={store.items.length} />
            <ResumeCard background='bg-yellow-200' title='Total BL' count={0} />
            <ResumeCard background='bg-green-200' title='BL Valides' count={0} />
            <ResumeCard background='bg-red-200' title='BL Supprimés' count={0} />
        </>
    }

    if (!data) {
        return <>
            <ResumeCard background='bg-primary text-white' text='text-white' title='Total Clients' count={store.items.length} />
            <ResumeCard background='bg-yellow-200' title='Total BL' count={0} />
            <ResumeCard background='bg-green-200' title='BL Valides' count={0} />
            <ResumeCard background='bg-red-200' title='BL Supprimés' count={0} />
        </>
    }



    return <>
        <ResumeCard background='bg-primary text-white' text='text-white' title='Total Clients' count={store.items.length} />
        <ResumeCard background='bg-yellow-200' title='Total BL' count={data.results.total} />
        <ResumeCard background='bg-green-200' title='BL Valides' count={data.results.valid} />
        <ResumeCard background='bg-red-200' title='BL Supprimés' count={data.results.deleted} />
    </>
}

const BonLivraisonSection = () => {

    const [dialogEcWithCheck, setDialogEcWithCheck] = useState(false)

    const store = useEntrepriseBonLivraisonStore()

    useEffect(() => {
        if (store.event?.status === 'done') {
            setDialogEcWithCheck(true)
        }
    }, [store.event?.status])


    return (
        <section className='p-4 text-gray-700'>
            {store.event?.status === 'done' && <DialogLoadEcrituresWithCheck open={dialogEcWithCheck} onOpen={setDialogEcWithCheck} />}
            <div className=''>

                <div className='flex items-center justify-between mb-8 '>
                    <div>

                        <h1 className='text-2xl text-[#101010] font-bold'>Bon de Livraison</h1>
                        {store.periode.length > 0 && <h2 className='text-xs'>{getFrenchMonthName(Number(store.periode[1]))} {store.periode[0]}</h2>}
                    </div>
                    <div className='flex items-center gap-4'>

                        <DialogLoadEcritures >

                            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                                <span><MdCloudDownload />
                                </span><span>Charger</span>
                            </Button>
                        </DialogLoadEcritures>
                    </div>
                </div>
                <div>
                    {/*                 {store.event?.jobId && <JobWatcher jobId={store.event.jobId} />}
 */}            </div>
                <div className='h-32 mb-4 shadow-none  grid grid-cols-4 gap-4 '>
                    <FilterResumeContainer />
                </div>
            </div>
            <Card className='p-4 shadow-none'>
                <FilterSection />
                <FilterResume />
                <div>
                    <TableBonLivraisonDigitalContainer />
                </div>
            </Card>
        </section>
    )
}

export default BonLivraisonSection