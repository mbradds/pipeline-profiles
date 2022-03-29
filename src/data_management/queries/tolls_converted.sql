select *
from
(
SELECT 
[PipelineID],
[FilingID],
[Effective Start],
[Effective End],
[Receipt Point],
[Delivery Point],
[Receipt Point]+'-'+ [Delivery Point] as [Path],
[Service],
[Product],
[Original Toll Value],
[Original Toll Unit],
[Converted Toll Value],
[Converted Toll Unit]
FROM [PipelineInformation].[dbo].[vwTolls]
) as tolls

where 
--(tolls.[PipelineID] = 'Alliance' and tolls.Path in ('System-CA/US border', 'Zone 2-CA/US border'))
--orSELECT 
  
--(tolls.[PipelineID] = 'Cochin')
--or
--(tolls.[PipelineID] = 'EnbridgeMainline' and tolls.Path in ('Edmonton Terminal, Alberta-Clearbrook, Minnesota',
--															'Edmonton Terminal, Alberta-Flanagan, Illinois',
--															'Edmonton Terminal, Alberta-Nanticoke, Ontario',
--															'Edmonton Terminal, Alberta-Superior, Wisconsin'))
--or
--(tolls.[PipelineID] = 'EnbridgeLocal' and tolls.Path in ('Edmonton Terminal, Alberta-International Boundary near Gretna, Manitoba', 'Edmonton Terminal, Alberta-Hardisty Terminal, Alberta'))
--or
--(tolls.[PipelineID] = 'EnbridgeFSP' and tolls.Path in ('Cromer, Manitoba-ALL',
--										  'Edmonton, Alberta-ALL',
--                                          'Hardisty, Alberta-ALL',
--                                          'Kerrobert, Saskatchewan-ALL',
--                                          'Regina, Saskatchewan-ALL'))
--or
--(tolls.[PipelineID] = 'EnbridgeLine9' and tolls.Path in ('Hardisty Terminal, Alberta-MONTREAL, QUEBEC'))
--or
(tolls.[PipelineID] = 'Keystone')
order by tolls.[PipelineID], tolls.Path, tolls.[Effective Start]
