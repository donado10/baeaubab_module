USE [TRANSIT]
GO

/****** Object:  Table [dbo].[F_ENTREPRISE_DIGITAL]    Script Date: 12/04/2026 20:30:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[F_ENTREPRISE_DIGITAL](
	[EN_No_Sage] [varchar](20) NULL,
	[EN_No_Digital] [bigint] NULL,
	[EN_Intitule] [varchar](100) NULL,
	[EN_TVA] [bigint] NULL,
	[created_at] [datetime] NULL,
	[created_sage_at] [datetime] NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[F_ENTREPRISE_DIGITAL] ADD  DEFAULT (getdate()) FOR [created_sage_at]
GO




CREATE TABLE [dbo].[F_DOCENTETE_DIGITAL](
	[DO_No] [bigint] NULL,
	[DO_Type] [int] NULL,
	[Client_ID] [bigint] NULL,
	[CT_Num] [varchar](50) NULL,
	[DO_TotalTTC] [numeric](18, 0) NULL,
	[DO_TotalHT] [numeric](18, 0) NULL,
	[DO_TotalTVA] [numeric](18, 0) NULL,
	[DO_Date] [datetime] NULL,
	[DO_Status] [int] NULL,
	[DO_FactureReference] [bigint] NULL,
	[DO_Entreprise_Sage] [varchar](20) NULL,
	[DO_Entreprise_Digital] [bigint] NULL,
	[LIV_No] [int] NULL,
	[created_at] [datetime] NULL,
	[created_sage_at] [datetime] NULL,
	[DO_Valide] [int] NULL,
	[DO_Transport] [numeric](18, 0) NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[F_DOCENTETE_DIGITAL] ADD  DEFAULT (getdate()) FOR [created_sage_at]
GO

ALTER TABLE [dbo].[F_DOCENTETE_DIGITAL] ADD  CONSTRAINT [DF_F_DOCENTETE_DIGITAL_DO_Valide]  DEFAULT ((0)) FOR [DO_Valide]
GO