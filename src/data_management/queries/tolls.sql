SELECT 
tValue.[PipelineID],
[Product],
[Receipt Point]+'-'+[Delivery Point] as [Path],
[Service],
[Units],
tInfo.[Effective Start],
tInfo.[Effective End],
case when tValue.Value <= 0
then round(tValue.Value, 0)
else round(tValue.Value, 1) end as [Value]
FROM [PipelineInformation].[dbo].[Tolls] as tValue
left join [PipelineInformation].[dbo].[Toll_Filing] as tInfo on tValue.PipelineID = tInfo.PipelineID and tValue.FilingID = tInfo.FilingID