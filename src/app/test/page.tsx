'use client'

import { DocumentPDF } from '@/features/digitale/bonLivraison/components/DocumentPDFRendered'
import { PDFViewer } from '@react-pdf/renderer'
import React from 'react'

const document = {
    "entete": {
        "DO_No": "221373",
        "Client_ID": "345",
        "CT_Num": "CL5908",
        "DO_TotalHT": 4720,
        "DO_Status": 1,
        "created_at": "2026-01-14T02:05:01.000Z",
        "EN_No": "630",
        "CT_No": "345",
        "CT_Intitule": "SONATEL FATICK COMMERCIALE"
    },
    "lignes": [
        {
            "DO_No": "221373",
            "Client_ID": "345",
            "CT_Num": "CL5908",
            "ART_No": "1",
            "ART_Qte": 4,
            "DO_TotalHT": 4720,
            "DO_Status": 1,
            "created_at": "2026-01-14T02:05:01.000Z",
            "EN_No": "630",
            "Art_Design": "BOUTEILLE 19L"
        }
    ]
}
const page = () => {
    return (
        <div className='w-2/4'>
            <PDFViewer width="100%" height="650px" style={{ border: 'none' }} >

                <DocumentPDF document={document} />
            </PDFViewer>
        </div>
    )
}

export default page