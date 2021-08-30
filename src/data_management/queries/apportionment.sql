SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
case when cap.PipelineID = 'TCPL'
then 'EnbridgeMainline'
else cap.PipelineID end as [Pipeline Name],
kp.[Key Point],
round([Available Capacity (1000 m3/d)], 2) as [Available Capacity (1000 m3/d)],
round([Original Nominations (1000 m3/d)], 2) as [Original Nominations (1000 m3/d)],
round([Accepted Nominations (1000 m3/d)], 2) as [Accepted Nominations (1000 m3/d)],
[Apportionment Percentage]
FROM [PipelineInformation].[dbo].[Capacity_Oil] as cap
left join [PipelineInformation].[dbo].[KeyPoint] as kp on cap.PipelineID = kp.PipelineID

order by cap.[PipelineID], kp.[Key Point], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)