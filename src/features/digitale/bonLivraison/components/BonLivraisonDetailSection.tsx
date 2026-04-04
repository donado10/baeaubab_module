'use client'
import React, { useEffect, useState } from 'react'
import { useEntrepriseBonLivraisonStore } from '../store/store'
import { Input } from '@/components/ui/input'
import { cn, formatDate, formatNumberToFrenchStandard } from '@/lib/utils';
import useGetEnterpriseBonLivraison from '../api/use-get-entreprise-bls';
import { useParams, usePathname } from 'next/navigation';
import { IAgence, IDocumentBonLivraison, IEntrepriseBonLivraison } from '../interface';
import { DocumentPDFBonLivraison, DocumentPDFFactureResume } from './DocumentPDFRendered';
import { usePDF } from '@react-pdf/renderer';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import useGetEntrepriseDG from '../api/use-get-entreprise-dg';
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import Link from 'next/link';
import useGetEntrepriseResidence from '../api/use-get-entreprise-residence';
import useGetEnterpriseResidenceBonLivraison from '../api/use-get-entreprise-residence-bls';
import { TableFactureDetail } from './Table/TableDetailFactures';
import useGetEnterpriseFactures from '../../bills/api/use-get-entreprise-bls';
import { DataTable } from "./TableEntrepriseDetail/table";



const DocumentPDFView = dynamic(
    () => import("./DocumentPDFViewer").then(m => m.DocumentPDFView),
    { ssr: false }
);



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

const Search = ({ onSetFilter }: { onSetFilter: (value: string) => void }) => {
    return <div className='flex items-center gap-4'>
        <Input onChange={(e) => onSetFilter(e.currentTarget.value)} className='w-full border border-gray-500 ' placeholder='Rechercher' />
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
            <div className='flex gap-4 items-center'>
                <span className='border-r-2 border-gray-500 pr-2'>{idClient}</span>
                <span className='text-xs'>{intituleClient}</span>
            </div>
        </div>
    </li>
}



const BonLivraisonListContainer = ({ onSetItemsBL, entreprise_id, month, year }: { onSetItemsBL: (items: IDocumentBonLivraison[]) => void, entreprise_id: string, month: string; year: string }) => {

    const { data, isPending } = useGetEnterpriseBonLivraison(entreprise_id.toString(), year, month)

    useEffect(() => {
        if (isPending) {
            return
        }

        if (!data) {
            return
        }
        onSetItemsBL(data.result)

    }, [entreprise_id, data])


    if (isPending) {
        return <></>
    }

    if (!data) {
        return <></>
    }


    return <BonLivraisonList p_documents={data.result as IDocumentBonLivraison[]} />
}
const BonLivraisonResidenceListContainer = ({ onSetItemsBL, entreprise_id, month, year }: { onSetItemsBL: (items: IDocumentBonLivraison[]) => void, entreprise_id: string, month: string; year: string }) => {

    const { data, isPending } = useGetEnterpriseResidenceBonLivraison(entreprise_id.toString(), year, month)

    useEffect(() => {
        if (isPending) {
            return
        }

        if (!data) {
            return
        }
        onSetItemsBL(data.result)

    }, [entreprise_id, data])


    if (isPending) {
        return <></>
    }

    if (!data) {
        return <></>
    }


    return <BonLivraisonList p_documents={data.result as IDocumentBonLivraison[]} />
}
const BonLivraisonList = ({ p_documents }: { p_documents: IDocumentBonLivraison[] }) => {
    const [isActive, setIsActive] = useState(null)
    const store = useEntrepriseBonLivraisonStore()
    const [documents, setDocuments] = useState<IDocumentBonLivraison[]>(p_documents)

    useEffect(() => {
        const document = documents.find((doc) => doc.entete.DO_No === isActive) ?? null
        store.setSelectedBonLivraison(document)
    }, [isActive])

    useEffect(() => {
        const filterBySearch = store.filter.searchByBL ? p_documents.filter((doc) => doc.entete.DO_No.includes(store.filter.searchByBL)) : [...p_documents]
        setDocuments(filterBySearch)
    }, [JSON.stringify(store.filter)])

    return <ul className='overflow-y-scroll'>
        {documents.map((document) => document.entete).map((document) =>
            <BonLivraisonResume key={document.DO_No} date={document.created_at} isActive={isActive} setActive={(ref) => setIsActive(ref)} idClient={document.CT_No} intituleClient={document.CT_Intitule} ref={document.DO_No} status={document.DO_Status.toString()} totalht={document.DO_TotalHT} />
        )}
    </ul>
}

const handleDownload = (fileUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${filename}.pdf`;
    link.click();
};

const BonLivraisonSelected = ({ document }: { document: IDocumentBonLivraison }) => {

    const [instance, updateInstance] = usePDF({ document: <DocumentPDFBonLivraison document={document} /> });

    useEffect(() => {
        updateInstance(<DocumentPDFBonLivraison document={document} />);
    }, [JSON.stringify(document)]);



    return <>

        <div className='  border-b border-gray-500 h-[15vh] p-8 '>
            <div className='flex items-center justify-between'>

                <div>
                    <span className='text-normal font-semibold'>{document.entete.CT_Intitule}</span>
                    <div>
                        <span className='text-xs'>Date bon de livraison: <strong>{formatDate(document.entete.created_at)}</strong></span>
                    </div>
                </div>
                <div>

                    <span className='font-bold'> REF-{document.entete.DO_No}</span>
                    <div>
                        {!instance.loading && <Button variant='ghost' onClick={() => { handleDownload(instance.url, `BL-REF-${document.entete.DO_No}`) }}>Download</Button>}

                    </div>
                </div>

            </div>
        </div>
        <div className='bg-gray-500/20  flex items-center justify-center'>
            {instance.loading ? 'loading...' :

                <DocumentPDFView fileUrl={instance.url} />

            }
        </div>
    </>
}
const FactureResume = ({ agence_dg, documentsBL, month, year }: { agence_dg: IAgence, documentsBL: IDocumentBonLivraison[], month: string, year: string }) => {


    const [instance, updateInstance] = usePDF({ document: <DocumentPDFFactureResume agence={agence_dg} documents={documentsBL} /> });

    useEffect(() => {
        updateInstance(<DocumentPDFFactureResume agence={agence_dg} documents={documentsBL} />);
    }, [JSON.stringify(agence_dg)]);



    return <>

        <div className='  border-b border-gray-500 h-[15vh] p-8 '>
            <div className='flex items-center justify-between'>

                <div className='flex flex-col '>
                    <span className='text-normal font-semibold'>{agence_dg.CT_Intitule}</span>
                    <span className='text-xs font-semibold'>{agence_dg.CT_No}</span>
                    <div>
                    </div>
                </div>
                <div>

                    <div>
                        {!instance.loading && <Button variant='ghost' onClick={() => { handleDownload(instance.url, `FACT-${agence_dg.CT_Num}-${year}-${month}`) }}>Download</Button>}

                    </div>
                </div>

            </div>
        </div>
        {instance.loading ? 'loading...' :
            <div className='bg-gray-500/20  flex items-center justify-center'>

                <DocumentPDFView fileUrl={instance.url} />

            </div>
        }
    </>
}

const FactureList = ({ agence_dg, documentsBL, month, year }: { agence_dg: IAgence, documentsBL: IDocumentBonLivraison[], month: string, year: string }) => {


    const { data, isPending } = useGetEnterpriseFactures(agence_dg.CT_Entreprise.toString(), year, month)

    if (isPending) {
        return <></>
    }
    if (!data) {
        return <></>
    }

    console.log(data)
    return <>

        <div className='  border-b border-gray-500 h-[15vh] p-8 '>
            <div className='flex items-center justify-between'>

                <div className='flex flex-col '>
                    <span className='text-normal font-semibold'>{agence_dg.CT_Intitule}</span>
                    <span className='text-xs font-semibold'>{agence_dg.CT_No}</span>
                    <div>
                    </div>
                </div>

            </div>
        </div>
        <div className='w-full  p-2'>
            <DataTable data={data.result} />

        </div>
        {/* {instance.loading ? 'loading...' :
            <div className='bg-gray-500/20  flex items-center justify-center'>

                <DocumentPDFView fileUrl={instance.url} />

            </div>
        } */}
    </>
}

export const BonLivraisonDetailSectionContainer = () => {
    const { entreprise_id } = useParams()
    const { data, isPending } = useGetEntrepriseDG(entreprise_id.toString())
    const store = useEntrepriseBonLivraisonStore()

    useEffect(() => {
        store.setItemsBL([])
    }, [entreprise_id])

    if (isPending
    ) {
        return <></>

    }
    if (!data) {
        return <></>

    }
    return <><BonLivraisonDetailSection agence={data.result} entreprise_id={entreprise_id.toString()} /></>
}
export const BonLivraisonResidenceDetailSectionContainer = () => {
    const { residence_id } = useParams()
    const { data, isPending } = useGetEntrepriseResidence(residence_id.toString())
    const store = useEntrepriseBonLivraisonStore()

    useEffect(() => {
        store.setItemsBL([])
    }, [residence_id])

    if (isPending
    ) {
        return <></>

    }
    if (!data) {
        return <></>

    }
    return <><BonLivraisonDetailSection agence={data.result} entreprise_id={residence_id.toString()} /></>
}

const BonLivraisonDetailSection = ({ agence, entreprise_id }: { agence: IAgence, entreprise_id: string }) => {
    const store = useEntrepriseBonLivraisonStore()
    const pathname = usePathname()

    const entreprise = store.items.find((en) => en.EN_No.toString() == entreprise_id.toString())


    const [nearEn, setNearEn] = useState<{ previous: IEntrepriseBonLivraison | null; next: IEntrepriseBonLivraison | null }>({ previous: null, next: null });
    useEffect(() => {

        for (let item = 0; item < store.items.length; item++) {
            if (store.items[item].EN_No.toString() !== entreprise_id.toString()) {
                continue
            }
            if (item === 0) {
                setNearEn({ previous: null, next: store.items[item + 1] })
                break
            }
            if (item !== 0) {
                setNearEn({ previous: store.items[item - 1], next: store.items[item + 1] })
                break
            }
            if (item === store.items.length - 1) {
                setNearEn({ previous: store.items[item - 1], next: null })
                break
            }
        }

    }, [entreprise_id])

    const new_path = pathname.split('/').slice(0, -1).join('/')

    return (
        <main className='flex  w-full min-h-screen border border-gray-500  overflow-scroll'>
            <div className='w-2/7 h-screen overflow-scroll border-r border-gray-500  '>
                <div className='border-b border-gray-500 p-8 h-[25vh]'>
                    <div className='mb-4'>
                        <h1 className='text-2xl font-bold mb-2'>Bon de Livraisons (<span className='text-xl font-light'>{store.itemsBL.length}</span>)</h1>
                        <div className='flex items-center gap-2'>
                            {nearEn?.previous && <Link href={new_path + '/' + nearEn.previous.EN_No}>
                                <CiCircleChevLeft />
                            </Link>}
                            <span className='text-xs italic'>{entreprise.EN_Intitule}</span>
                            {nearEn?.next && <Link href={new_path + '/' + nearEn.next.EN_No}>
                                <CiCircleChevRight
                                />
                            </Link>}
                        </div>
                    </div>
                    <div>
                        <Search onSetFilter={(value) => store.setFilter({ ...store.filter, searchByBL: value })} />
                    </div>
                </div>
                <div className='h-[80vh] overflow-y-scroll'>


                    {agence.type_client_id != 1 && <BonLivraisonListContainer onSetItemsBL={(values: IDocumentBonLivraison[]) => store.setItemsBL(values)} month={store.periode[1]} year={store.periode[0]} entreprise_id={entreprise_id.toString()} />
                    }
                    {agence.type_client_id == 1 && <BonLivraisonResidenceListContainer onSetItemsBL={(values: IDocumentBonLivraison[]) => store.setItemsBL(values)} month={store.periode[1]} year={store.periode[0]} entreprise_id={entreprise_id.toString()} />
                    }
                </div>
            </div>
            <div className='w-5/7 flex flex-col h-screen overflow-scroll'>

                {store.selectedBonLivraison && <BonLivraisonSelected document={store.selectedBonLivraison} />}
                {!store.selectedBonLivraison && store.itemsBL.length > 0 && <FactureList month={store.periode[1]} year={store.periode[0]} agence_dg={agence} documentsBL={store.itemsBL.filter((bl) => bl.entete.DO_Status != 2)} />}

            </div>
        </main>
    )
}


