export enum EModuleStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export interface IModule {
  Mod_No: string;
  Mod_Description: string;
  Mod_Status: EModuleStatus;
}
