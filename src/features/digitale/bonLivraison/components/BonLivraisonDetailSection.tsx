'use client'
import React, { useEffect, useState } from 'react'
import { useEntrepriseBonLivraisonStore } from '../store/store'
import { Input } from '@/components/ui/input'
import { GoDotFill } from 'react-icons/go';
import { cn, convertDate, formatDate, formatNumberToFrenchStandard } from '@/lib/utils';
import useGetEnterpriseBonLivraison from '../api/use-get-entreprise-bls';
import { useParams } from 'next/navigation';
import { IDocumentBonLivraison } from '../interface';


const StatusDisplay = ({ value }: { value: string }) => {
    const MStatusDisplay = new Map<string, string>([
        ["1", "bg-green-600/20 border-2 border-green-600 "],
        ["2", "bg-red-600/20  border-2 border-red-600"],
    ]);
    const MStatusDisplayColor = new Map<string, string>([
        ["1", "#00a63e"],
        ["2", "#e7000b"],
    ]);
    const MStatusDisplayTextColor = new Map<string, string>([
        ["1", "text-green-600"],
        ["2", "text-[#e7000b]"],
    ]);
    const MStatusText = new Map<string, string>([
        ["1", "Valide"],
        ["2", "Supprimé"],
    ]);

    return (
        <div
            className={cn(
                "capitalize rounded-md px-4  font-semibold flex items-center gap-2  ",
                MStatusDisplay.get(value.toString())
            )}
        >
            <h1 className={cn(MStatusDisplayTextColor.get(value.toString()))}>

                {MStatusText.get(value.toString())}
            </h1>
        </div>
    );
};

const Search = () => {
    const store = useEntrepriseBonLivraisonStore()
    return <div className='flex items-center gap-4'>
        <Input onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-full border border-gray-500 ' placeholder='Rechercher' />

    </div>
}

const BonLivraisonResume = ({ date, status, totalht, ref, idClient, intituleClient, isActive, setActive }: { date: string, status: string, totalht: number, ref: string, idClient: string, intituleClient: string, isActive: string, setActive: (ref: string) => void }) => {


    return <li onClick={() => {

        if (isActive === ref) {
            setActive(null)
            return
        }
        setActive(ref)
    }}

        className={cn('w-full h-40  border-b border-gray-500 p-8 flex flex-col', 'hover:cursor-pointer hover:bg-gray-500/20', isActive === ref && 'bg-gray-500/20')}>
        <div className='flex items-center justify-between mb-4'>
            <StatusDisplay value={status} />
            <span className='font-bold'>{formatNumberToFrenchStandard(totalht)} FCFA</span>
        </div>
        <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold'>REF-{ref}</h2>
                <span>{formatDate(date)}</span>
            </div>
            <div className='flex gap-4'>
                <span className='border-r-2 border-gray-500 pr-2'>{idClient}</span>
                <span>{intituleClient}</span>
            </div>
        </div>
    </li>
}



const BonLivraisonListContainer = ({ entreprise_id }: { entreprise_id: string }) => {
    const store = useEntrepriseBonLivraisonStore()

    const { data, isPending } = useGetEnterpriseBonLivraison(entreprise_id.toString(), store.periode[0], store.periode[1])


    if (isPending) {
        return <></>
    }

    if (!data) {
        return <></>
    }
    return <BonLivraisonList documents={data.result as IDocumentBonLivraison[]} />
}
const BonLivraisonList = ({ documents }: { documents: IDocumentBonLivraison[] }) => {
    const [isActive, setIsActive] = useState(null)
    const store = useEntrepriseBonLivraisonStore()

    useEffect(() => {
        const document = documents.find((doc) => doc.entete.DO_No === isActive) ?? null
        store.setSelectedBonLivraison(document)
    }, [isActive])

    return <ul className='overflow-y-scroll'>
        {documents.map((document) => document.entete).map((document) =>
            <BonLivraisonResume key={document.DO_No} date={document.created_at} isActive={isActive} setActive={(ref) => setIsActive(ref)} idClient={document.CT_No} intituleClient={document.CT_Intitule} ref={document.DO_No} status={document.DO_Status.toString()} totalht={document.DO_TotalHT} />
        )}
    </ul>
}

const BonLivraisonSelected = () => {
    const store = useEntrepriseBonLivraisonStore()
    const document = store.selectedBonLivraison
    return <>

        <div className='  border-b border-gray-500 h-[15vh] p-8'>
            <div className='flex items-center justify-between'>

                <div>
                    <span className='text-normal font-semibold'>{document.entete.CT_Intitule}</span>
                    <div>
                        <span className='text-xs'>Date bon de livraison: <strong>{formatDate(document.entete.created_at)}</strong></span>
                    </div>
                </div>
                <span className='font-bold'> REF-{document.entete.DO_No}</span>
            </div>
        </div>
        <div className='bg-gray-500/20 flex-1'>

        </div>
    </>
}

const BonLivraisonDetailSection = () => {
    const store = useEntrepriseBonLivraisonStore()
    const { entreprise_id } = useParams()

    const entreprise = store.items.find((en) => en.EN_No.toString() == entreprise_id.toString())



    return (
        <main className='flex  w-full min-h-screen border border-gray-500  '>
            <div className='w-2/7 h-screen  border-r border-gray-500  '>
                <div className='border-b border-gray-500 p-8 h-[25vh]'>
                    <div className='mb-4'>
                        <h1 className='text-2xl font-bold '>Bon de Livraisons</h1>
                        <span className='text-xs italic'>{entreprise.EN_Intitule}</span>
                    </div>
                    <div>
                        <Search />
                    </div>
                </div>
                <div className='h-[80vh] overflow-y-scroll'>

                    <BonLivraisonListContainer entreprise_id={entreprise_id.toString()} />
                </div>
            </div>
            <div className='w-5/7 flex flex-col'>

                {store.selectedBonLivraison && <BonLivraisonSelected />}
            </div>
        </main>
    )
}

export default BonLivraisonDetailSection