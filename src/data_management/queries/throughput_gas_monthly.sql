SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
throughput.[PipelineID] as [Pipeline Name],
case when kp.[Key Point] = 'FortisBC Lower Mainland'
then 'Huntingdon/FortisBC Lower Mainland'
when kp.[Key Point] = 'Huntingdon Export'
then 'Huntingdon/FortisBC Lower Mainland'
else kp.[Key Point]
end as [Key Point],
[Direction of Flow],
[Trade Type],
case when throughput.[PipelineID] in ('Brunswick')
then null
else round(avg([Capacity (1000 m3/d)]),3) 
end as [Capacity (1000 m3/d)],
round(avg([Throughput (1000 m3/d)]),3) as [Throughput (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Gas] as throughput

left join [PipelineInformation].[dbo].[KeyPoint] as kp on throughput.KeyPointId = kp.KeyPointId

group by [Year], [Month], throughput.[PipelineID], kp.[Key Point], [Direction of Flow], [Trade Type]
order by throughput.[PipelineID], kp.[Key Point], [Year], [Month]