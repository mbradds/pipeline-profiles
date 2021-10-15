SELECT 
tValue.[PipelineID],
tValue.FilingID,
[Product],
[Receipt Point]+'-'+[Delivery Point] as [Path],
[Service],
[Units],
tInfo.[Effective Start],
tInfo.[Effective End],
tValue.Value as [Value]
FROM [PipelineInformation].[dbo].[Tolls] as tValue
left join [PipelineInformation].[dbo].[Toll_Filing] as tInfo on tValue.PipelineID = tInfo.PipelineID and tValue.FilingID = tInfo.FilingID