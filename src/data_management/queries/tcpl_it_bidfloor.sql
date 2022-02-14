--IT_BidFloor
SELECT [Date],
[Receipt Point] + ' to ' + [Delivery Point] as [Path], 
round([Total Contracted Quantity (GJ)], 0) as [Total Contracted Quantity (GJ)],
F.[Folder Link], F.[Download Link]
FROM [IT_BidFloor] T
LEFT JOIN [Financial_Filing] F ON T.FilingID = F.FilingID