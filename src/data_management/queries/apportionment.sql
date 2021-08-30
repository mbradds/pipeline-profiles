SELECT 
cast(str([Month])+'-'+'1'+'-'+str([Year]) as date) as [Date],
cap.PipelineID as [Pipeline Name],
kp.[Key Point],
round([Available Capacity (1000 m3/d)], 2) as [Available Capacity (1000 m3/d)],
round([Original Nominations (1000 m3/d)], 2) as [Original Nominations (1000 m3/d)],
round([Accepted Nominations (1000 m3/d)], 2) as [Accepted Nominations (1000 m3/d)],
[Apportionment Percentage]
FROM [PipelineInformation].[dbo].[Capacity_Oil] as cap
left join [PipelineInformation].[dbo].[KeyPoint] as kp on cap.KeyPointID = kp.KeyPointID
where cap.PipelineID not in ('Westspur', 'Montreal', 'SouthernLights') 
and kp.[Key Point] not in ('Regina', 'Windsor', 'Into-Sarnia', 'ex-Gretna', 'Superior', 'Westover', 'Cromer', 'Edmonton', 'Flanagan', 'Kerrobert')
order by cap.[PipelineID], kp.[Key Point], cast(str([Month])+'-'+'1'+'-'+str([Year]) as date)