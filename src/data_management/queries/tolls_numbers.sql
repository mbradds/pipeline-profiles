SELECT
[PipelineID],
[FilingID] as [id],
[Toll Schedule Folder] as [f],
[Toll Schedule Download] as [d],
[Effective Start] as [s],
[Effective End] as [e]
FROM [PipelineInformation].[dbo].[Toll_Filing]

group by PipelineID, FilingID, [Toll Schedule Folder], [Toll Schedule Download], [Effective Start], [Effective End]
order by PipelineID, FilingID, [Effective Start]