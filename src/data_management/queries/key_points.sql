SELECT
[Key Point],
case when PipelineID = 'TCPL' then 'EnbridgeMainline'
when PipelineID = 'EnbridgeMainline' then 'TCPL'
else PipelineID end as [Pipeline Name],
[Latitude],
[Longitude]
FROM [PipelineInformation].[dbo].[KeyPoint]

where [KeyPointID] <> 'KP0000'