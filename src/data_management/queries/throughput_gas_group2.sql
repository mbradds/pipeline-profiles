SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
company.Company as [Corporate Entity],
throughput.[PipelineID] as [Pipeline Name],
[KeyPointID] as [Key Point],
[Direction of Flow],
[Trade Type],
--round(avg([Capacity (1000 m3/d)]),3) as [Capacity (1000 m3/d)],
null as [Capacity (1000 m3/d)],
round(avg([Throughput (1000 m3/d)]),3) as [Throughput (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Gas] as throughput

left join [PipelineInformation].[dbo].[Pipeline_System] as pipe on throughput.PipelineID = pipe.PipelineID
left join [PipelineInformation].[dbo].[Company] as company on pipe.CompanyID = company.CompanyID

where throughput.PipelineID = 'Brunswick'
group by [Year], [Month], company.Company, throughput.[PipelineID], [KeyPointID], [Direction of Flow], [Trade Type]
order by throughput.[PipelineID], [KeyPointID], [Year], [Month]