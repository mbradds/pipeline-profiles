select 
hc.[Date],
hc.PipelineID as [Pipeline Name],
kp.KeyPointID,
[Direction of Flow],
[Product],
round([Throughput (1000 m3/d)], 4) as [Throughput (1000 m3/d)],
case when hc.PipelineID in ('Montreal', 'SouthernLights', 'Westspur')
then null 
else round([Available Capacity (1000 m3/d)], 4)
end as [Available Capacity (1000 m3/d)]

from
(

SELECT 
cast(str(month(throughput.[Date]))+'-'+'1'+'-'+str(year(throughput.[Date])) as date) as [Date],
throughput.[PipelineID],
throughput.[KeyPointID],
throughput.[Direction of Flow],
throughput.[Product],
avg([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Oil] as throughput
left join [PipelineInformation].[dbo].[Capacity_Oil] as capacity on
throughput.[Date] = capacity.[Date]
and throughput.[PipelineID] = capacity.[PipelineID]
and throughput.[KeyPointID] = capacity.[KeyPointID]
where throughput.PipelineId <> 'TransMountain'
group by year(throughput.[Date]), month(throughput.[Date]), throughput.[PipelineID], throughput.[KeyPointID], throughput.[Direction of Flow], throughput.Product

union all

SELECT
cast(str(month(throughput.[Date]))+'-'+'1'+'-'+str(year(throughput.[Date])) as date) as [Date],
throughput.[PipelineID],
throughput.[KeyPointID],
throughput.[Direction of Flow],
throughput.[Product],
avg([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Oil] as throughput
left join [PipelineInformation].[dbo].[Capacity_Oil] as capacity on 
throughput.[Date] = capacity.[Date]
and throughput.[PipelineID] = capacity.[PipelineID]
where throughput.PipelineId = 'TransMountain'
group by year(throughput.[Date]), month(throughput.[Date]), throughput.[PipelineID], throughput.[KeyPointID], throughput.[Direction of Flow], throughput.Product
) as hc
left join [PipelineInformation].[dbo].[KeyPoint] as kp on hc.KeyPointId = kp.KeyPointId
order by hc.PipelineID, kp.[Key Point], [Date]