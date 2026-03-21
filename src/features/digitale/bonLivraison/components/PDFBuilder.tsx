'use client'
import { PDFViewer } from '@react-pdf/renderer'
import React from 'react'
import { DocumentPDF } from './DocumentPDFRendered'


type Props = {}

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

const PDFBuilder = (props: Props) => {
    return (
        <div><div className='w-4/4'>
            <PDFViewer width="100%" height="650px" style={{ border: 'none' }} >

                <DocumentPDF document={document} />
            </PDFViewer>
        </div></div>
    )
}

export default PDFBuilder