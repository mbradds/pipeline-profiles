SELECT 
[EnglishProjectName],
[ProjectShortName],
[CS10FolderName],
[CS10FolderId]
FROM [Regulatory_Untrusted].[_ERS].[Project]
where len(EnglishProjectName) > 0
order by EnglishProjectName