import { EPermission } from "@/lib/enum";
import { z } from "zod";

export const carDocumentSchema = z.object({
  file: z.file().or(z.string()),
  hashname: z.string(),
  nom: z.string(),
  fileID: z.string().optional(),
});

export const carTableInfo = z.object({
  car_no: z.string(),
  car_matricule: z.string(),
  car_modele: z.string(),
  car_fullname: z.string(),
  car_mileage: z.string(),
  car_status: z.string(),
});

export const carSchema = z.object({
  car_no: z.string(),
  car_fueltype: z.string(),
  car_tankcapacity: z.string(),
  car_mileage: z.string(),
  car_chassisnumber: z.string(),
  car_enginenumber: z.string(),
  car_fiscalpower: z.string(),
  car_payload: z.string(),
  car_acquisitiondate: z.string(),
  car_acquisitiontype: z.string(),
  car_registrationnumber: z.string(),
  car_circulationdate: z.string(),
  car_acquisitionvalue: z.string(),
  car_owner: z.string(),
  car_addons: z.object({
    registrationcard: z.string(),
    modele: z.string(),
    marque: z.string(),
    year: z.string(),
    assurance: z.string(),
    status: z.string(),
    matricule: z.string(),
    documents: z.array(carDocumentSchema),
  }),
});
