SELECT 
[Id] as [id],
[EnglishName] as e,
[FrenchName] as f
--[IsContravention],
--[IsIncident],
--[IsContraventionPower]
FROM [Regulatory_Untrusted].[_ERS].[CompositeTrait] WHERE Discriminator = 'BasicCause' and IsContravention = '1'