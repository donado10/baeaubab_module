"use client"

import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from "@react-pdf/renderer";
import { createTw } from "@hyperline/react-pdf-tailwind";
import { useEffect, useState } from "react";
import { IAgence, IDocumentFacture } from "../interface";
import BaeaubabLogo from "@/assets/images/logo_.png";
import { formatDate } from "@/lib/utils";
import { useParams } from "next/navigation";
import useGetEntrepriseDG from "../api/use-get-entreprise-dg";


// The 'theme' object is your Tailwind theme config
const tw = createTw({
    theme: {
        fontFamily: {
            sans: ["Comic Sans"],
        },
        extend: {
            colors: {
                custom: "#bada55",
            },
        },
    },
});

export function DocumentPDFFacture({ document }: { document: IDocumentFacture }) {
    return (
        <Document>
            {/* Remove 'flex' from the page style and use 'flex-col' for vertical stacking */}
            <Page size="A4" style={tw("p-8 flex-col border-none")}>

                {/* Main Wrapper */}
                <View style={tw('w-full')}>

                    {/* Header Section - Changed from gap-16 to specific margin-bottom */}
                    <View style={tw("w-full flex flex-row justify-between items-center mb-10")}>
                        <View>
                            <Image style={tw("w-24 h-24")} src={BaeaubabLogo.src} />
                        </View>
                        <View>
                            <Text style={tw("text-base font-bold text-right")}>{document.entete.CT_Intitule}</Text>
                            <Text style={tw("text-sm text-right")}>Facture No: {document.entete.DO_No}</Text>
                            <Text style={tw("text-sm text-right")}>Date Facture: {formatDate(document.entete.DO_Date)}</Text>
                        </View>
                    </View>

                    {/* From / To Section */}
                    <View style={tw("w-full flex flex-row justify-between mb-10")}>
                        <View style={tw('flex gap-1')}>
                            <Text style={tw("text-lg font-bold")}>Expéditeur</Text>
                            <Text style={tw("text-sm font-bold")}>Baeaubab Senegal</Text>
                            <Text style={tw("text-sm")}>Ecole Normal en face ecole police</Text>
                            <Text style={tw("text-sm")}>Email: baeaubab@baeaubab.com</Text>
                            <Text style={tw("text-sm")}>Téléphone: +221 33 865 40 40</Text>
                        </View>
                        <View style={tw('flex gap-1')}>
                            <Text style={tw("text-lg font-bold text-right")}>Destinataire</Text>
                            <Text style={tw("text-sm font-bold text-right")}>{document.entete.CT_Intitule}</Text>
                            <Text style={tw("text-sm")}>{document.entete.CT_Addresse}</Text>
                            <Text style={tw("text-sm")}>Email: {document.entete.CT_Email}</Text>
                            {document.entete.CT_Phone && <Text style={tw("text-sm")}>Téléphone: {document.entete.CT_Phone}</Text>}
                        </View>
                    </View>

                    {/* Table Section */}
                    <View style={tw("w-full")}>
                        {/* Header Row */}
                        <View style={tw("w-full flex flex-row border border-black bg-gray-300")}>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Référence</Text>
                            <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black font-bold")}>Designation</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Quantité</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 font-bold")}>Prix</Text>
                        </View>

                        {/* Data Rows */}
                        {document.lignes.map((ligne, i) => (
                            <View key={i} style={tw("w-full flex flex-row border-l border-r border-b border-black")}>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black")}>{ligne.Art_Design}</Text>
                                <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black")}>{ligne.Art_Code ?? 'N/A'}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black")}>{ligne.ART_Qte ?? 'N/A'}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2")}>{(ligne.DO_TotalHT).toFixed(2)}</Text>
                            </View>
                        ))}

                        {/* Total Section */}
                        <View style={tw("mt-4 flex flex-row justify-end")}>
                            <Text style={tw("text-[12px] p-2 border border-black font-bold")}>
                                Total: {(document.lignes.reduce((prev, next) => prev + next.DO_TotalHT, 0)).toFixed(2)} FCFA
                            </Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
}

export const DocumentPDFFactureResumeContainer = ({ documents, agence }: { documents: IDocumentFacture[], agence: IAgence }) => {


    return <PDFViewer width="100%" height="650px" style={{ border: 'none' }} >
        <DocumentPDFFactureResume documents={documents} agence={agence} />
    </PDFViewer>
}

export function DocumentPDFFactureResume({ agence, documents }: { agence: IAgence, documents: IDocumentFacture[] }) {
    const [prices, setPrices] = useState({
        totalHT: documents.reduce((prev, next) => prev + next.entete.DO_TotalHT, 0),
        TVA: Math.round((documents.reduce((prev, next) => prev + next.entete.DO_TotalHT, 0)) * 0.18),
    })

    useEffect(() => {
        setPrices({
            totalHT: documents.reduce((prev, next) => prev + next.entete.DO_TotalHT, 0),
            TVA: Math.round((documents.reduce((prev, next) => prev + next.entete.DO_TotalHT, 0)) * 0.18),
        })
    }, [JSON.stringify(agence)])


    return (
        <Document>
            {/* Remove 'flex' from the page style and use 'flex-col' for vertical stacking */}
            <Page size="A4" style={tw("p-8 flex-col border-none")}>

                {/* Main Wrapper */}
                <View style={tw('w-full')}>

                    {/* Header Section - Changed from gap-16 to specific margin-bottom */}
                    <View style={tw("w-full flex flex-row justify-between items-center mb-10")}>
                        <View>
                            <Image style={tw("w-24 h-24")} src={BaeaubabLogo.src} />
                        </View>
                        <View>
                            <Text style={tw("text-base font-bold text-right")}>{agence.CT_Intitule}</Text>
                        </View>
                    </View>

                    {/* From / To Section */}
                    <View style={tw("w-full flex flex-row justify-between mb-10")}>
                        <View style={tw('flex gap-1')}>
                            <Text style={tw("text-lg font-bold")}>Expéditeur</Text>
                            <Text style={tw("text-sm font-bold")}>Baeaubab Senegal</Text>
                            <Text style={tw("text-sm")}>Ecole Normal en face ecole police</Text>
                            <Text style={tw("text-sm")}>Email: baeaubab@baeaubab.com</Text>
                            <Text style={tw("text-sm")}>Téléphone: +221 33 865 40 40</Text>
                        </View>
                        <View style={tw('flex gap-1')}>
                            <Text style={tw("text-lg font-bold text-right")}>Destinataire</Text>
                            <Text style={tw("text-sm font-bold text-right")}>{agence.CT_Intitule}</Text>
                            <Text style={tw("text-sm")}>{agence.CT_Addresse}</Text>
                            <Text style={tw("text-sm")}>Email: {agence.CT_Email}</Text>
                            {agence.CT_Phone && <Text style={tw("text-sm")}>Téléphone: {agence.CT_Phone}</Text>}
                        </View>
                    </View>

                    {/* Table Section */}
                    <View style={tw("w-full")}>
                        {/* Header Row */}
                        <View style={tw("w-full flex flex-row border border-black bg-gray-300")}>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Numéro BL</Text>
                            <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black font-bold")}>Agence</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Date</Text>
                            <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>Taux</Text>
                            <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>Remise</Text>
                            <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>Total</Text>
                        </View>

                        {/* Data Rows */}
                        {documents.map((document, i) => (
                            <View key={i} style={tw("w-full flex flex-row border-l border-r border-b border-black")}>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>REF-{document.entete.DO_No}</Text>
                                <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black font-bold")}>{document.entete.CT_Intitule}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>{formatDate(document.entete.DO_Date)}</Text>
                                <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>{agence.CT_TVA == '1' ? '18%' : '0%'}</Text>
                                <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>0</Text>
                                <Text style={tw("text-[10px] w-[10%] p-2 border-r border-black font-bold")}>{document.entete.DO_TotalHT}</Text>
                            </View>
                        ))}

                        {/* Total Section */}
                        <View style={tw("mt-4 flex flex-col border border-black justify-end ml-auto")}>
                            <Text style={tw("text-[12px] p-2  font-bold")}>
                                TotalHT: {prices.totalHT} FCFA
                            </Text>
                            {agence.CT_TVA == '1' && <Text style={tw("text-[12px] p-2  font-bold")}>
                                TVA: {prices.TVA} FCFA
                            </Text>}
                            {agence.CT_TVA == '1' && <Text style={tw("text-[12px] p-2  font-bold")}>
                                TotalTTC: {prices.totalHT + prices.TVA} FCFA
                            </Text>}
                            {agence.CT_TVA != '1' && <Text style={tw("text-[12px] p-2  font-bold")}>
                                TotalTTC: {prices.totalHT} FCFA
                            </Text>}
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
}