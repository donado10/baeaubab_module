"use client"

import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from "@react-pdf/renderer";
import { createTw } from "@hyperline/react-pdf-tailwind";
import { useState } from "react";
import { IDocumentBonLivraison } from "../interface";
import BaeaubabLogo from "@/assets/images/logo_.png";
import { formatDate } from "@/lib/utils";


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

export function DocumentPDF({ document }: { document: IDocumentBonLivraison }) {
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
                            <Text style={tw("text-sm text-right")}>BL No: {document.entete.DO_No}</Text>
                            <Text style={tw("text-sm text-right")}>Date BL: {formatDate(document.entete.created_at)}</Text>
                        </View>
                    </View>

                    {/* From / To Section */}
                    <View style={tw("w-full flex flex-row justify-between mb-10")}>
                        <View>
                            <Text style={tw("text-lg font-bold")}>Expéditeur</Text>
                            <Text style={tw("text-sm font-bold")}>Baeaubab Senegal</Text>
                            <Text style={tw("text-sm")}>Ecole Normal en face ecole police</Text>
                            <Text style={tw("text-sm")}>Email: baeaubab@baeaubab.com</Text>
                            <Text style={tw("text-sm")}>Téléphone: +221 33 865 40 40</Text>
                        </View>
                        <View>
                            <Text style={tw("text-lg font-bold text-right")}>Destinataire</Text>
                            <Text style={tw("text-sm font-bold text-right")}>{document.entete.CT_Intitule}</Text>
                        </View>
                    </View>

                    {/* Table Section */}
                    <View style={tw("w-full")}>
                        {/* Header Row */}
                        <View style={tw("w-full flex flex-row border border-black bg-gray-50")}>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Article</Text>
                            <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black font-bold")}>Designation</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>Quantité</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black font-bold")}>P.U.</Text>
                            <Text style={tw("text-[10px] w-[15%] p-2 font-bold")}>Prix</Text>
                        </View>

                        {/* Data Rows */}
                        {document.lignes.map((ligne, i) => (
                            <View key={i} style={tw("w-full flex flex-row border-l border-r border-b border-black")}>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black")}>{ligne.ART_No}</Text>
                                <Text style={tw("text-[10px] w-[40%] p-2 border-r border-black")}>{ligne.Art_Design}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black")}>{ligne.ART_Qte}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2 border-r border-black")}>{(ligne.DO_TotalHT / ligne.ART_Qte).toFixed(2)}</Text>
                                <Text style={tw("text-[10px] w-[15%] p-2")}>{ligne.DO_TotalHT}</Text>
                            </View>
                        ))}

                        {/* Total Section */}
                        <View style={tw("mt-4 flex flex-row justify-end")}>
                            <Text style={tw("text-[12px] p-2 border border-black font-bold")}>
                                Total: {document.lignes.reduce((prev, next) => prev + next.DO_TotalHT, 0)} FCFA
                            </Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
}