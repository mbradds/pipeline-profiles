--Discretionary_Revenue (PipelineInformation)
SELECT [Date],
round([Revenue ($000s)], 0) as [Revenue ($000s)],
[Particulars],
[Download Link]
FROM [Discretionary_Revenue] T
LEFT JOIN [Financial_Filing] F ON T.FilingID = F.FilingID