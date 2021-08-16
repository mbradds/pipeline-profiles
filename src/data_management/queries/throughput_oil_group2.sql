select 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
company.Company as [Corporate Entity],
[Energy Information Pipeline Name] as [Pipeline Name],
[KeyPointID] as [Key Point],
[Direction of Flow],
Product,
round([Throughput (1000 m3/d)], 2) as [Throughput (1000 m3/d)],
null as [Available Capacity (1000 m3/d)]
--round([Available Capacity (1000 m3/d)], 2) as [Available Capacity (1000 m3/d)]
from (

SELECT 
throughput.[Month],
throughput.[Year],
throughput.[PipelineID],
throughput.[KeyPointID],
pipe.CompanyID,
pipe.[Energy Information Pipeline Name],
throughput.[Direction of Flow],
throughput.[Product],
avg([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Oil] as throughput
left join [PipelineInformation].[dbo].[Capacity_Oil] as capacity on 
throughput.Year = capacity.Year and throughput.Month = capacity.Month
and throughput.[PipelineID] = capacity.[PipelineID]
and throughput.[KeyPointID] = capacity.[KeyPointID]
left join [PipelineInformation].[dbo].[Pipeline_System] as pipe on throughput.PipelineID = pipe.PipelineID
where throughput.[PipelineID] in ('Montreal', 'SouthernLights', 'Westspur')
group by throughput.Year, throughput.Month, pipe.CompanyID, pipe.[Energy Information Pipeline Name], throughput.[PipelineID], throughput.[KeyPointID], throughput.[Direction of Flow], throughput.Product
)
as hc

left join [PipelineInformation].[dbo].[Company] as company on hc.CompanyID = company.CompanyID

order by hc.[CompanyID], [KeyPointID], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)