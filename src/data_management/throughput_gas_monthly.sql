SELECT
cast(cast([Month] as varchar)+'-'+'1'+'-'+cast([Year] as varchar) as date) as [Date],
[Corporate Entity],
[Key Point],
[Direction of Flow],
[Trade Type],
round(avg([Capacity (1000 m3/d)]),0) as [Capacity (1000 m3/d)],
round(avg([Throughput (1000 m3/d)]),0) as [Throughput (1000 m3/d)]
FROM [EnergyData].[dbo].[Pipelines_Gas]
where [Year] >= '2010'

group by [Year], [Month], [Corporate Entity], [Key Point], [Direction of Flow], [Trade Type]
order by [Corporate Entity],[Key Point], [Year], [Month]