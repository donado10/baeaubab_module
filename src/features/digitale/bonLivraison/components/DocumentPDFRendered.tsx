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
        <>
            <Document >
                <Page size="A4"
                    style={tw("p-8 flex flex-row flex-wrap gap-4 border-none")}>
                    <View style={tw('flex flex-col gap-16 w-full justify-between')}>
                        <View style={tw("w-full flex flex-row justify-between gap-4")}>
                            <View>
                                <Image style={tw("w-32 h-32")} src={BaeaubabLogo.src} />
                            </View>
                            <View >
                                <Text style={tw("text-base font-bold text-end ml-auto")}>{document.entete.CT_Intitule}</Text>
                                <Text style={tw("text-base text-end ml-auto")}>BL No: {document.entete.DO_No}</Text>
                                <Text style={tw("text-base text-end ml-auto")}>Date BL: {formatDate(document.entete.created_at)}</Text>
                            </View>
                        </View>
                        <View style={tw("w-full flex flex-row justify-between gap-4")}>
                            <View >
                                <Text style={tw("text-xl font-bold")}>From</Text>
                                <Text style={tw("text-base font-bold")}>Baeaubab Senegal</Text>
                                <Text style={tw("text-base")}>Ecole Normal en face ecole police</Text>
                                <Text style={tw("text-base")}>Email: baeaubab@baeaubab.com</Text>
                                <Text style={tw("text-base")}>Téléphone: +221 33 865 40 40</Text>
                            </View>
                            <View >
                                <Text style={tw("text-xl font-bold text-end  ml-auto")}>To</Text>
                                <Text style={tw("text-base font-bold text-end ml-auto")}>{document.entete.CT_Intitule}</Text>
                            </View>
                        </View>

                    </View>
                </Page>
            </Document>
        </>
    );
}
