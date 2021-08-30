SELECT
[PipelineID],
[Energy Information Pipeline Name] as [pipeEng],
[Energy Information Pipeline Name FRA] as [pipeFra],
company.Company as [companyEng],
company.[Company FRA] as [companyFra],
[Commodity]
FROM [PipelineInformation].[dbo].[Pipeline_System] as pipe
left join [PipelineInformation].[dbo].[Company] as company on pipe.CompanyID = company.CompanyID
where pipe.PipelineID not in ('EnbridgeFSP', 'EnbridgeLine9', 'EnbridgeLocal', 'AltaGas', 'PouceCoupe', 'Taylor', 'Vantage')
union all
select
'Plains' as PipelineID,
'Plains Midstream' as pipeEng,
'Plains Midstream' as pipeFra,
'Plains Midstream Canada ULC' as companyEng,
'Plains Midstream Canada ULC' as companyFra,
'Liquid' as Commodity