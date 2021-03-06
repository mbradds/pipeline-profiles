SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
[Corporate Entity],
[Pipeline Name],
[Key Point],
round([Available Capacity (1000 m3/d)], 2) as [Available Capacity (1000 m3/d)],
round([Original Nominations (1000 m3/d)], 2) as [Original Nominations (1000 m3/d)],
round([Accepted Nominations (1000 m3/d)], 2) as [Accepted Nominations (1000 m3/d)],
[Apportionment Percentage]
FROM [EnergyData].[dbo].[Pipelines_Capacity_Oil]

order by [Corporate Entity], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)