select *
from
(
SELECT
KeyPointID,
[Key Point],
PipelineID as [Pipeline Name],
[Latitude],
[Longitude],
[Description],
[Description FRA]
FROM [PipelineInformation].[dbo].[KeyPoint]
where [KeyPointID] <> 'KP0000' and (Latitude is not null and Longitude is not null)
union all
SELECT
'KPWESC' as KeyPointID,
'Huntingdon/FortisBC Lower Mainland' as [Key Point],
PipelineID as [Pipeline Name],
[Latitude],
[Longitude],
[Description],
[Description FRA]
FROM [PipelineInformation].[dbo].[KeyPoint]
where [KeyPointID] = 'KP0019'
) as kp
where kp.[Key Point] not in ('Windsor', 'Regina', 'St Clair')
order by [Pipeline Name], [Key Point]