SELECT
[Project_Id] as [id],
rtrim(ltrim([ProjectShortNameEnglish])) as [e],
ltrim([ProjectShortNameFrench]) as [f]
FROM [Regulatory_Untrusted].[B-05584].[Project]