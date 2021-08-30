SELECT
[Key Point],
PipelineID as [Pipeline Name],
[Latitude],
[Longitude]
FROM [PipelineInformation].[dbo].[KeyPoint]
where [KeyPointID] <> 'KP0000' and (Latitude is not null and Longitude is not null)