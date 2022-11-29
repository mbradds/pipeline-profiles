SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
throughput.[PipelineID] as [Pipeline Name],
case when kp.KeyPointID = 'KP0017'
then 'KPWESC'
when kp.KeyPointID = 'KP0019'
then 'KPWESC'
when kp.KeyPointID = 'KP0035'
then 'KP0074'
else kp.KeyPointID
end as [KeyPointID],
[Direction of Flow],
case when kp.KeyPointID = 'KP0029'
then [Trade Type]+'-'+[Direction of Flow]
else [Trade Type] end as [Trade Type],
case when throughput.[PipelineID] in ('Brunswick')
then null
else round(avg([Capacity (1000 m3/d)]), 4) 
end as [Capacity (1000 m3/d)],
round(avg([Throughput (1000 m3/d)]), 4) as [Throughput (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Gas] as throughput

left join [PipelineInformation].[dbo].[KeyPoint] as kp on throughput.KeyPointId = kp.KeyPointId

group by [Year], [Month], throughput.[PipelineID], kp.KeyPointID, [Direction of Flow], [Trade Type]
order by throughput.[PipelineID], kp.KeyPointID, [Year], [Month], [Trade Type], [Direction of Flow]