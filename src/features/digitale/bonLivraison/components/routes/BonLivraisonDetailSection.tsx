'use client'
import React, { useEffect, useState } from 'react'
import { useEntrepriseBonLivraisonStore } from '../../store/store'
import { Input } from '@/components/ui/input'
import { cn, formatDate, formatNumberToFrenchStandard } from '@/lib/utils';
import useGetEnterpriseBonLivraison from '../../api/use-get-entreprise-bls';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { IAgence, IDocumentBonLivraison, IEntreprise, IEntrepriseBonLivraison } from '../../interface';
import { DocumentPDFBonLivraison, DocumentPDFFactureResume } from '../DocumentPDFRendered';
import { usePDF } from '@react-pdf/renderer';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import useGetEntrepriseDG from '../../api/use-get-entreprise-dg';
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import Link from 'next/link';
import useGetEntrepriseResidence from '../../api/use-get-entreprise-residence';
import useGetEnterpriseResidenceBonLivraison from '../../api/use-get-entreprise-residence-bls';
import { TableFactureDetail } from '../Table/TableDetailFactures';
import useGetEnterpriseFactures from '../../api/use-get-entreprise-factures';
import { DataTable } from "../TableEntrepriseDetail/table";
import { useEntrepriseDetailStore } from '../../store/entreprise-store';
import { GrRadial, GrRadialSelected } from "react-icons/gr";
import useGenerateFacturesFromBonLivraison from '../../api/use-generate-facture-from-bls';
import { toast } from 'sonner';
import JobWatcher from '../JobWatcher';
import { DialogCancelFactures } from '../DialogCancelFactures';
import { MdCloudDownload } from 'react-icons/md';
import { fi, is, se } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import JobWatcherEntrepriseDetail from '../JobWatcherEntrepriseDetail';




const DocumentPDFView = dynamic(
    () => import("../DocumentPDFViewer").then(m => m.DocumentPDFView),
    { ssr: false }
);



const StatusDisplay = ({ value }: { value: string }) => {
    const MStatusDisplay = new Map<string, string>([
        ["0", "bg-gray-600/20 border-2 border-gray-600 "],
        ["1", "bg-green-600/20 border-2 border-green-600 "],
        ["2", "bg-red-600/20  border-2 border-red-600"],
    ]);
    const MStatusDisplayColor = new Map<string, string>([
        ["0", "#4a5565"],
        ["1", "#00a63e"],
        ["2", "#e7000b"],
    ]);
    const MStatusDisplayTextColor = new Map<string, string>([
        ["0", "text-gray-600"],
        ["1", "text-green-600"],
        ["2", "text-[#e7000b]"],
    ]);
    const MStatusText = new Map<string, string>([
        ["0", "En Attente"],
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

const BonLivraisonResume = ({ date, status, deleted, totalht, ref, idClient, intituleClient, isActive, setActive }: { deleted: boolean, date: string, status: string, totalht: number, ref: string, idClient: string, intituleClient: string, isActive: string, setActive: (ref: string) => void }) => {

    const store = useEntrepriseDetailStore()

    return <li onClick={() => {
        if (store.selectedOption) {
            if (store.cart.includes(ref)) {
                store.setRemoveCart(ref)
                return
            }
            store.setAddCart(ref)
            return

        }
        if (isActive === ref) {
            setActive(null)
            return
        }
        setActive(ref)
    }}

        className={cn('w-full h-40 relative  border-b border-gray-500 p-8 flex flex-col', 'hover:cursor-pointer hover:bg-gray-500/20', isActive === ref && 'bg-gray-500/20', store.selectedOption && store.cart.includes(ref) && 'bg-gray-500/20')}>
        {store.selectedOption && <div className='absolute top-0 left-0 p-2'><GrRadial />
        </div>}
        {store.selectedOption && store.cart.includes(ref) && <div className='absolute top-0 left-0 p-2'><GrRadialSelected />

        </div>}
        <div className='flex items-center justify-between mb-4'>
            <StatusDisplay value={deleted ? '2' : status} />
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



const BonLivraisonListContainer = () => {

    const store = useEntrepriseDetailStore()

    const [documents, setDocuments] = useState<IDocumentBonLivraison[]>(store.documents)

    useEffect(() => {
        if (store.selectedOption) {
            const filterDocuments = store.documents.filter((doc) => doc.entete.DO_Status != 2 && doc.entete.DO_Valide != 1)
            setDocuments(filterDocuments)

        } else {
            setDocuments(store.documents)
        }
    }, [store.selectedOption, JSON.stringify(store.documents)])


    return <BonLivraisonList p_documents={documents} />
}

const BonLivraisonList = ({ p_documents }: { p_documents: IDocumentBonLivraison[] }) => {
    const [isActive, setIsActive] = useState(null)
    const store = useEntrepriseDetailStore()
    const [documents, setDocuments] = useState<IDocumentBonLivraison[]>(p_documents)

    useEffect(() => {
        const document = documents.find((doc) => doc.entete.DO_No === isActive) ?? null
        store.setSelectedBonLivraison(document)
    }, [isActive])

    useEffect(() => {
        setIsActive(null)
    }, [store.selectedOption])

    useEffect(() => {
        const filterBySearch = store.filter.searchByBL ? p_documents.filter((doc) => doc.entete.DO_No.includes(store.filter.searchByBL)) : [...p_documents]
        setDocuments(filterBySearch)
    }, [JSON.stringify(store.filter), JSON.stringify(p_documents)])


    return <ul className='overflow-y-scroll'>
        {documents.map((document) => document.entete).map((document) =>
            <BonLivraisonResume key={document.DO_No} deleted={document.DO_Status == 2} date={document.created_at} isActive={isActive} setActive={(ref) => setIsActive(ref)} idClient={document.CT_No} intituleClient={document.CT_Intitule} ref={document.DO_No} status={document.DO_Valide.toString()} totalht={document.DO_TotalHT} />
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

    const entrepriseStore = useEntrepriseDetailStore()
    const { data, isPending } = useGetEnterpriseFactures(agence_dg.CT_Entreprise_Sage.toString(), year, month)
    const { mutate } = useGenerateFacturesFromBonLivraison()

    const [instance, updateInstance] = usePDF({
        document: <DocumentPDFFactureResume agence={agence_dg} documents={documentsBL.filter((bl) => entrepriseStore.cart.includes(bl.entete
            .DO_No)
        ) ?? []
        } />
    });

    useEffect(() => {
        updateInstance(<DocumentPDFFactureResume agence={agence_dg} documents={documentsBL.filter((bl) => entrepriseStore.cart.includes(bl.entete
            .DO_No)
        ) ?? []} />);
    }, [JSON.stringify(agence_dg), JSON.stringify(entrepriseStore.cart)]);

    if (isPending) {
        return <></>
    }
    if (!data) {
        return <></>
    }

    const submitHandler = () => {


        const id_toast = toast(() => {

            const store = useEntrepriseDetailStore()

            return (
                <div className="text-white">
                    <h1 >En cours</h1>
                    {store.event && <JobWatcherEntrepriseDetail jobId={store.event.jobId} />}
                </div >
            )
        },
            {
                duration: Infinity,
                style: {
                    background: 'green'
                }
            });


        mutate({ json: { en_list: [agence_dg.CT_Entreprise_Sage.toString()], year, month, bl_list: entrepriseStore.cart } }, {
            onSuccess: (results: any) => {
                entrepriseStore.setEvent({ ec_count: "", ec_total: "", jobId: results.jobId, status: "pending", id_toast_job: id_toast as string })
            }
        })


    }

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

                    {entrepriseStore.billCart.length > 0 && !entrepriseStore.selectedOption && <DialogCancelFactures >

                        <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                            <span><MdCloudDownload />
                            </span><span>Annuler Factures</span>
                        </Button>
                    </DialogCancelFactures>}

                    {entrepriseStore.cart.length > 0 && <Button variant='outline' onClick={submitHandler}>
                        Générer Facture
                    </Button>}
                </div>

            </div>
        </div>
        <div className='w-full  p-2'>
            {!entrepriseStore.selectedOption && <DataTable data={data.results.documents} />}

            {entrepriseStore.selectedOption && (instance.loading ? 'loading...' :
                <div className='bg-gray-500/20  flex items-center justify-center'>

                    <DocumentPDFView fileUrl={instance.url} />

                </div>)
            }
        </div>
    </>
}

export const BonLivraisonDetailSectionContainer = () => {
    const { entreprise_id } = useParams()
    const searchParams = useSearchParams()
    const { data, isPending } = useGetEnterpriseBonLivraison(entreprise_id.toString(), searchParams.get('year') ?? '', searchParams.get('month') ?? '')
    const store = useEntrepriseDetailStore()
    const queryClient = useQueryClient()

    useEffect(() => {

        if (store.event?.status === 'done' && store.periode.length > 0) {
            store.clear()
            queryClient.invalidateQueries({ queryKey: ["entreprise_bls", entreprise_id, store.periode[0], store.periode[1]], exact: true })
            queryClient.invalidateQueries({ queryKey: ["entreprise_factures", entreprise_id, store.periode[0], store.periode[1]], exact: true })
            return
        }
    }, [JSON.stringify(store.event)])


    useEffect(() => {
        const year = searchParams.get('year') ?? ''
        const month = searchParams.get('month') ?? ''
        store.setPeriode(year, month)
    }, [JSON.stringify(searchParams)])

    useEffect(() => {
        if (isPending) {
            store.clear()
            return
        }

        if (!data) {
            return
        }
        store.setDocuments(data.results.documents)
        store.setEntreprise(data.results.entreprise)
        store.setAgence(data.results.entrepriseDG)
        store.setAdjacent(data.results.adjacent)
    }, [isPending, data?.results])

    if (isPending
    ) {
        return <></>

    }
    if (!data) {
        return <></>


    }
    return <>{store.documents.length > 0 && <BonLivraisonDetailSection />} </>
}


const BonLivraisonDetailSection = () => {
    const store = useEntrepriseDetailStore()
    const pathname = usePathname()


    const [adjacentEN, setAdjacentEn] = useState<{ previous: IEntreprise | null; next: IEntreprise | null }>({ previous: store.adjacent?.previous ?? null, next: store.adjacent?.next ?? null });


    const new_path = pathname.split('/').slice(0, -1).join('/')

    return (
        <main className='flex  w-full min-h-screen border border-gray-500  overflow-scroll'>
            <div className='w-2/7 h-screen overflow-scroll border-r border-gray-500  '>
                <div className='border-b border-gray-500 p-8 h-[30vh]'>
                    <div className='mb-4'>
                        <h1 className='text-2xl font-bold mb-2'>Bon de Livraisons (<span className='text-xl font-light'>{store.documents.length}</span>)</h1>
                        <div className='flex items-center gap-2'>
                            {adjacentEN?.previous && <Link onClick={() => store.clear()} href={new_path + '/' + adjacentEN.previous.EN_No_Sage + '?year=' + store.periode[0] + '&month=' + store.periode[1]}>
                                <CiCircleChevLeft />
                            </Link>}
                            <span className='text-xs italic'>{store.entreprise.EN_Intitule}</span>
                            {adjacentEN?.next && <Link onClick={() => store.clear()} href={new_path + '/' + adjacentEN.next.EN_No_Sage + '?year=' + store.periode[0] + '&month=' + store.periode[1]}>
                                <CiCircleChevRight
                                />
                            </Link>}
                        </div>
                    </div>
                    <div className='mb-4'>
                        <Search onSetFilter={(value) => store.setFilter({ ...store.filter, searchByBL: value })} />
                    </div>
                    <div>
                        <Button onClick={() => {
                            store.setSelectedOption(!store.selectedOption)
                        }}>
                            {store.selectedOption && <span><GrRadialSelected /></span>}
                            {!store.selectedOption && <span><GrRadial /></span>}
                            <span>

                                Select
                            </span>
                        </Button>
                    </div>
                </div>
                <div className='h-[80vh] overflow-y-scroll'>


                    <BonLivraisonListContainer />

                </div>
            </div>
            <div className='w-5/7 flex flex-col h-screen overflow-scroll'>

                {store.selectedBonLivraison && <BonLivraisonSelected document={store.selectedBonLivraison} />}
                {!store.selectedBonLivraison && store.documents.length > 0 && <FactureList month={store.periode[1]} year={store.periode[0]} agence_dg={store.agence} documentsBL={store.documents.filter((bl) => bl.entete.DO_Status != 2)} />}

            </div>
        </main>
    )
}


