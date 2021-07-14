SELECT
[Id] as id,
rtrim(ltrim([EnglishName])) as e,
rtrim(ltrim([FrenchName])) as f
-- [DisplayOrder]
FROM [Regulatory_Untrusted].[_ERS].[ContaminantCategory]