SELECT 
[Id],
[EnglishName],
[FrenchName]
--[IsContravention],
--[IsIncident],
--[IsContraventionPower]
FROM [Regulatory_Untrusted].[_ERS].[CompositeTrait] WHERE Discriminator = 'BasicCause'