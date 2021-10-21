SELECT
[PipelineID],
[FilingID] as [id],
-- [Toll Schedule Folder],
[Effective Start] as [s],
[Effective End] as [e]
FROM [PipelineInformation].[dbo].[Toll_Filing]

group by PipelineID, FilingID, [Effective Start], [Effective End]
order by PipelineID, FilingID, [Effective Start]