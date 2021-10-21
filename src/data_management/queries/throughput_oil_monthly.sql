select 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
hc.PipelineID as [Pipeline Name],
kp.KeyPointID,
[Direction of Flow],
[Product],
round([Throughput (1000 m3/d)], 2) as [Throughput (1000 m3/d)],
case when hc.PipelineID in ('Montreal', 'SouthernLights', 'Westspur')
then null 
else round([Available Capacity (1000 m3/d)], 2)
end as [Available Capacity (1000 m3/d)]

from
(

SELECT 
throughput.[Month],
throughput.[Year],
throughput.[PipelineID],
throughput.[KeyPointID],
throughput.[Direction of Flow],
throughput.[Product],
sum([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Oil] as throughput
left join [PipelineInformation].[dbo].[Capacity_Oil] as capacity on 
throughput.Year = capacity.Year and throughput.Month = capacity.Month
and throughput.[PipelineID] = capacity.[PipelineID]
and throughput.[KeyPointID] = capacity.[KeyPointID]
where throughput.PipelineId <> 'TransMountain'
group by throughput.Year, throughput.Month, throughput.[PipelineID], throughput.[KeyPointID], throughput.[Direction of Flow], throughput.Product

union all

SELECT 
throughput.[Month],
throughput.[Year],
throughput.[PipelineID],
throughput.[KeyPointID],
throughput.[Direction of Flow],
throughput.[Product],
sum([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [PipelineInformation].[dbo].[Throughput_Oil] as throughput
left join [PipelineInformation].[dbo].[Capacity_Oil] as capacity on 
throughput.Year = capacity.Year and throughput.Month = capacity.Month
and throughput.[PipelineID] = capacity.[PipelineID]
where throughput.PipelineId = 'TransMountain'
group by throughput.Year, throughput.Month, throughput.[PipelineID], throughput.[KeyPointID], throughput.[Direction of Flow], throughput.Product
) as hc
left join [PipelineInformation].[dbo].[KeyPoint] as kp on hc.KeyPointId = kp.KeyPointId
-- where hc.PipelineID not in ('EnbridgeLine9')
order by hc.PipelineID, kp.[Key Point], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)