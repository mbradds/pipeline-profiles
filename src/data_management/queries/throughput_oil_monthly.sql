select 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
[Corporate Entity],
[Pipeline Name],
[Key Point],
[Direction of Flow],
Product,
case when [Corporate Entity] <> 'Enbridge Pipelines Inc.'
then round([Throughput (1000 m3/d)], 2)
else round([Throughput (1000 m3/d)], 4)
end as [Throughput (1000 m3/d)],
case when [Corporate Entity] <> 'Enbridge Pipelines Inc.'
then round([Available Capacity (1000 m3/d)], 2)
else round([Available Capacity (1000 m3/d)], 4)
end as [Available Capacity (1000 m3/d)]
from (
SELECT 
throughput.[Month],
throughput.[Year],
throughput.[Corporate Entity],
throughput.[Pipeline Name],
throughput.[Key Point],
throughput.[Direction of Flow],
throughput.[Product],
sum([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [EnergyData].[dbo].[Pipelines_Throughput_Oil] as throughput
left join [EnergyData].[dbo].[Pipelines_Capacity_Oil] as capacity on 
throughput.Year = capacity.Year and throughput.Month = capacity.Month
and throughput.[Corporate Entity] = capacity.[Corporate Entity]
and throughput.[Pipeline Name] = capacity.[Pipeline Name]
and throughput.[Key Point] = capacity.[Key Point]
where throughput.[Corporate Entity] <> 'Trans Mountain Pipeline ULC'
group by throughput.Year, throughput.Month, throughput.[Corporate Entity], throughput.[Pipeline Name], throughput.[Key Point], throughput.[Direction of Flow], throughput.Product
union all
SELECT 
throughput.[Month],
throughput.[Year],
throughput.[Corporate Entity],
throughput.[Pipeline Name],
throughput.[Key Point],
[Direction of Flow],
[Product],
sum([Throughput (1000 m3/d)]) as [Throughput (1000 m3/d)],
avg(capacity.[Available Capacity (1000 m3/d)]) as [Available Capacity (1000 m3/d)]
FROM [EnergyData].[dbo].[Pipelines_Throughput_Oil] as throughput
left join [EnergyData].[dbo].[Pipelines_Capacity_Oil] as capacity on 
throughput.Year = capacity.Year and throughput.Month = capacity.Month
and throughput.[Corporate Entity] = capacity.[Corporate Entity]
and throughput.[Pipeline Name] = capacity.[Pipeline Name]
where throughput.[Corporate Entity] = 'Trans Mountain Pipeline ULC'
group by throughput.Year, throughput.Month, throughput.[Corporate Entity], throughput.[Pipeline Name], throughput.[Key Point], throughput.[Direction of Flow], throughput.Product
) as hc
order by [Corporate Entity], [Pipeline Name], [Key Point], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)