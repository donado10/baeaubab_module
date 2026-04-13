"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn, formatNumberToFrenchStandard, getFrenchMonthName } from '@/lib/utils'
import { DialogLoadFacture } from '../DialogLoadFacture'
import { EStatus, useEntrepriseFactureStore } from '../../store/store'
import { DialogGetFacture } from '../DialogGetFacture'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MdCloudDownload } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import FactureTableContainer from '../TableContainer'
import { IEntrepriseFacture } from '../../interface'
import useGetFactureStatsByCompany from '../../api/use-get-facture'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import useGetFactureStats from '../../api/use-get-facture-stats'
import { DialogCancelFactures } from '../DialogCancelFactures'



const FactureStatCard = ({ title, count, background, text = 'text-gray-700' }: { title: string, count: number | string, background: string, text?: string }) => {
    return <Card className={cn('shadow-none p-4 gap-4 flex flex-row items-center justify-between', background)}>
        <div className='flex flex-col gap-4'>

            <h1 className={cn('text-base font-normal ', text)}>{title}</h1>
            <h2 className='font-bold text-3xl italic '>{count}</h2>
        </div>
        <IoDocumentTextOutline width={1600} height={1600} size={40} />
    </Card>
}

const FactureSelectType = ({ onSetType, disabled }: { onSetType: (value: 'entreprise_id' | 'Intitule') => void, disabled: boolean }) => {
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

const FactureSearch = () => {
    const store = useEntrepriseFactureStore()
    return <div className='flex items-center gap-4'>
        <Input disabled={store.items.length <= 0} onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-64' placeholder='Rechercher' />
        <FactureSelectType disabled={store.items.length <= 0} onSetType={(value: 'entreprise_id' | 'Intitule') => {

            store.setFilter({ ...store.filter, search: { ...store.filter.search, type: value } })
        }} />
    </div>
}

const FactureFilterSection = () => {
    const store = useEntrepriseFactureStore()
    const classNameButton = 'p-0 hover:bg-transparent hover:text-primary/30  rounded-none'



    return <div>

        <div className='border-b border-gray-200 flex items-center justify-between  gap-8 p-2'>

            <div className=' border-gray-200 flex items-center gap-8'>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.ALL ? 'text-primary font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.ALL })} disabled={store.items.length <= 0}>Tout</Button>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.VALID ? 'text-green-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.VALID })} disabled={store.items.length <= 0}>Valide</Button>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.WAITING ? ' text-yellow-600 font-semibold  text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.WAITING })} disabled={store.items.length <= 0}>Attente</Button>
            </div>
            <div className='flex items-center gap-4'>
                <FactureSearch />
            </div>
        </div>
        <FactureFilterResume />
    </div>
}

const FactureFilterResumeCard = ({ value }: { value: string }) => {
    return <span className='border-2 border-red-600 text-xs px-2 py-1 rounded-md text-red-600 font-semibold bg-red-600/20'>{value}</span>
}

const FactureFilterResume = () => {
    const store = useEntrepriseFactureStore()
    if (store.filter.status !== EStatus.ALL) {
        return <></>
    }
    return <ul className='flex items-center gap-4'>
        {

            store.filter.invalide && store.filter.invalide.map((value) => <li key={value}><FactureFilterResumeCard value={value} /></li>)
        }
        {store.filter.ecart_conformite !== 0 && <li key={'ecart'}><FactureFilterResumeCard value={`ecart: ${store.filter.ecart_conformite}`} /></li>}
    </ul>
}

const FactureStatsContainer = () => {
    const store = useEntrepriseFactureStore()
    const { data, isPending } = useGetFactureStats(store.periode[0], store.periode[1])

    if (isPending) {
        return <>
            <FactureStatCard background='bg-primary text-white' text='text-white' title='Total Factures' count={0} />
            <FactureStatCard background='bg-yellow-200' title="Chiffre d'Affaire Total" count={0} />
            <FactureStatCard background='bg-green-200' title="Chiffre d'Affaire Taxables" count={0} />
            <FactureStatCard background='bg-gray-200' title="Chiffre d'Affaire Exonorés" count={0} />
        </>
    }

    if (!data) {
        return <>
            <FactureStatCard background='bg-primary text-white' text='text-white' title='Total Clients' count={0} />
            <FactureStatCard background='bg-yellow-200' title="Chiffre d'Affaire Total" count={0} />
            <FactureStatCard background='bg-green-200' title="Chiffre d'Affaire Taxables" count={0} />
            <FactureStatCard background='bg-gray-200' title="Chiffre d'Affaire Exonorés" count={0} />
        </>
    }



    return <>
        <FactureStatCard background='bg-primary text-white' text='text-white' title='Total Clients' count={data.results.factures} />
        <FactureStatCard background='bg-yellow-200' title="Chiffre d'Affaire Total" count={formatNumberToFrenchStandard(data.results.total)} />
        <FactureStatCard background='bg-green-200' title="Chiffre d'Affaire Taxables" count={formatNumberToFrenchStandard(data.results.taxable)} />
        <FactureStatCard background='bg-gray-200' title="Chiffre d'Affaire Exonorés" count={formatNumberToFrenchStandard(data.results.exonore)} />
    </>
}


const FactureButtonContainer = () => {
    const store = useEntrepriseFactureStore()
    return <div className='flex items-center gap-4'>

        {store.items.length > 0 && <DialogCancelFactures >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Annuler Factures</span>
            </Button>
        </DialogCancelFactures>}


        <DialogLoadFacture >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Charger</span>
            </Button>
        </DialogLoadFacture>
    </div>
}


const FactureSectionContainer = () => {
    const store = useEntrepriseFactureStore()
    const searchParams = useSearchParams()
    const { data, isPending } = useGetFactureStatsByCompany(store.periode[0], store.periode[1])
    const router = useRouter()
    const queryClient = useQueryClient()


    useEffect(() => {

        if (store.event?.status === 'done' && store.periode.length > 0) {
            queryClient.invalidateQueries({ queryKey: ["get-facture-stats-by-company", store.periode[0], store.periode[1]], exact: true })
            queryClient.invalidateQueries({ queryKey: ["get-facture-stats", store.periode[0], store.periode[1]], exact: true })
            return
        }
    }, [JSON.stringify(store.event)])


    useEffect(() => {

        if (store.periode.length === 0) {
            return
        }
        if (store.periode.length > 0) {
            router.push(`/m1/facture?year=${store.periode[0]}&month=${store.periode[1]}`)
            return
        }
    }, [JSON.stringify(store.periode)])

    useEffect(() => {
        if (searchParams.get('year') && searchParams.get('month')) {
            store.setPeriode(searchParams.get('year')!, searchParams.get('month')!)
        }
    }, [searchParams.get('year'), searchParams.get('month')])

    useEffect(() => {


        if (isPending) {

            return
        }
        if (!data) {
            return
        }

        store.setItems(data.result)

    }, [JSON.stringify(data)])


    if (isPending) {
        return <FactureSection documents={[]} />
    }
    if (!data) {
        return <FactureSection documents={[]} />
    }

    return <FactureSection documents={data.result} />
}

const FactureSection = ({ documents }: { documents: IEntrepriseFacture[] }) => {

    const [dialogFacture, setDialogFacture] = useState(false)


    const store = useEntrepriseFactureStore()

    return (
        <section className='p-4 text-gray-700'>
            {store.event?.status === 'done' && <DialogGetFacture open={dialogFacture} onOpen={setDialogFacture} />}
            <div className=''>

                <div className='flex items-center justify-between mb-8 '>
                    <div>

                        <h1 className='text-2xl text-[#101010] font-bold'>Facture</h1>
                        {store.periode.length > 0 && <h2 className='text-xs'>{getFrenchMonthName(Number(store.periode[1]))} {store.periode[0]}</h2>}
                    </div>
                    <div>
                        <FactureButtonContainer />
                    </div>

                </div>
                <div className='h-32 mb-4 shadow-none  grid grid-cols-4 gap-4 '>
                    <FactureStatsContainer />
                </div>
            </div>
            <Card className='p-4 shadow-none'>
                <div>
                    <FactureFilterSection />
                </div>

                <div>
                    <FactureTableContainer />
                </div>
            </Card>
        </section>
    )
}



export default FactureSectionContainer