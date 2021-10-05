SELECT
rtrim(ltrim([Company])) as [Company],
count([EventNumber]) as [Old Events]
FROM [Regulatory_Untrusted].[_ERS].[vwRemediationEventDetails]
where Reported <= '2018-08-15' and Company is not null
group by rtrim(ltrim([Company]))
order by count([EventNumber]) desc