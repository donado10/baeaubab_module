export enum EFeatureStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export interface IFeature {
  Feat_No: string;
  Feat_Description: string;
  Feat_Status: EFeatureStatus;
}
