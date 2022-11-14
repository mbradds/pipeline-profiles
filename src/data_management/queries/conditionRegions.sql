select 
--regions.Region_SKey as [id],
ROW_NUMBER() OVER (ORDER BY regions.Region_SKey asc) as [id],
rtrim(ltrim(RegionEnglish))+'/'+province_keys.ProvinceEnglish as [e],
rtrim(ltrim(RegionFrench))+'/'+province_keys.ProvinceFrench as [f]
FROM [Regulatory_Untrusted].[B-05584].[Region] as regions

left join
(
	select
	region.Region_SKey,
	region.Province_SKey,
	province.ProvinceEnglish,
	province.ProvinceFrench
	from
	(
	SELECT 
	[Region_SKey],
	[Province_SKey]
	FROM [Regulatory_Untrusted].[B-05584].[InstrumentRegion]
	group by [Region_SKey], [Province_SKey]
	union all
	select
	'10' as Region_SKey,
	'9' as Province_SKey
	union all
	select
	'46' as Region_SKey,
	'7' as Province_SKey
	) as region

	left join
	(
	SELECT 
	[Province_SKey],
	rtrim(ltrim([ProvinceEnglish])) as [ProvinceEnglish],
	rtrim(ltrim([ProvinceFrench])) as [ProvinceFrench]
	FROM [Regulatory_Untrusted].[B-05584].[Province]
	) as province on region.Province_SKey = province.Province_SKey

) as province_keys on regions.Region_SKey = province_keys.Region_SKey

order by regions.Region_SKey