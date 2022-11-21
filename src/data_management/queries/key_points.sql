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
where [KeyPointID] not in ('KP0000', 'KP0064', 'KP0067', 'KP0065', 'KP0062', 'KP0063', 'KP0066', 'KP0035')
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
where kp.[Key Point] not in ('Windsor', 'Regina', 'St Clair', 'FortisBC Lower Mainland', 'Huntingdon Export')
order by [Pipeline Name], [Key Point]