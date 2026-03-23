
import { DocumentPDFBonLivraison, DocumentPDFFactureResume, DocumentPDFFactureResumeContainer } from '@/features/digitale/bonLivraison/components/DocumentPDFRendered'
import { IDocumentBonLivraison } from '@/features/digitale/bonLivraison/interface'
import React from 'react'

const documents: IDocumentBonLivraison[] = [
    {
        "entete": {
            "DO_No": "221373",
            "Client_ID": "345",
            "CT_Num": "CL5908",
            "DO_TotalHT": 4720,
            "DO_Status": 1,
            "created_at": "2026-01-19T02:05:01.000Z",
            "EN_No": "630",
            "CT_No": "345",
            "CT_Intitule": "SONATEL FATICK COMMERCIALE",
            "CT_Addresse": "",
            "CT_Email": "",
            "CT_Phone": "",
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
                "created_at": "2026-01-19T02:05:01.000Z",
                "EN_No": "630",
                "Art_Design": "BOUTEILLE 19L",
                "Art_Code": "B19",
                "DO_PrixUnitaire": 1997
            }
        ]
    },
    {
        "entete": {
            "DO_No": "221374",
            "Client_ID": "345",
            "CT_Num": "CL5908",
            "DO_TotalHT": 4720,
            "DO_Status": 1,
            "created_at": "2026-01-14T02:05:01.000Z",
            "EN_No": "630",
            "CT_No": "345",
            "CT_Intitule": "SONATEL FATICK COMMERCIALE",
            "CT_Addresse": "",
            "CT_Email": "",
            "CT_Phone": "",
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
                "Art_Design": "BOUTEILLE 19L",
                "Art_Code": "B19",
                "DO_PrixUnitaire": 1997
            }
        ]
    }
]

const agence = {
    "CT_No": "1189",
    "CT_Intitule": "SONATEL DIRECTION GENERALE",
    "CT_Num": "CL2478",
    "CT_TVA": 1,
    "CT_DG": 1,
    "CT_Entreprise": "630",
    "CT_Phone": "77 644 85 12",
    "CT_Addresse": "VDN",
    "CT_Email": "SOULEYMANE.SAMATE@orange-sonatel.com",
    "created_at": "2022-08-25T10:02:37.000Z"
}

const page = () => {
    return (
        <div className='w-2/4'>
            <>

                <DocumentPDFFactureResumeContainer agence={agence} entreprise_id='630' documents={documents} />
            </>
        </div>
    )
}

export default page