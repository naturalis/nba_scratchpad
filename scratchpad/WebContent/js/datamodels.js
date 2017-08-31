function processPathData( docType, data )
{
	if (data==null) 
	{
		setMessage( "didn't find datamodels for "+docType );
		return;
	}
		
	for(var i=0;i<data.length;i++)
	{
		var f = data[i];
		availableFields.push({ 
			document: docType,
			label: docType+' '+f,
			searchable: docType+' '+f, 
			field: f 
		});				
	}
	
	setMessage( "read datamodels for "+docType );
}

function addOperatorsToAvailableFields( document, field, operators, type, indexed )
{
	for(var i=0;i<availableFields.length;i++)
	{
		if (availableFields[i].document==document && availableFields[i].field==field)
		{
			availableFields[i].type=type;
			availableFields[i].indexed=(indexed===true || indexed=="true");
			availableFields[i].allowedOperators=operators;
		}
	}
}
	
function processFieldData( docType, data )
{
	if (data==null) 
	{
		setMessage( "didn't find field info for "+docType );
		return;
	}

	for(var field in data)
	{
		var f=data[field];
		addOperatorsToAvailableFields( docType, field, f.allowedOperators, f.type, f.indexed );
	}
	setMessage( "read field info for "+docType );
}

function getDataModels()
{	
	availableFields.length=0;

	if (server==undefined) return;
	if (server.noServices==true) return;
	
	for (var n=0;n<documentTypes.length;n++)
	{
		var docType = documentTypes[n];

		var url = server.url + "/" + nbaServerConfig.version + "/" + docType + nbaServerConfig.metaServiceUrls.getPaths
		
		var p={
			dataType: "json",
			async: false,
		};

		if (server.allowCrossDomain)
		{		
			p.url=url;
			p.success=function(data) { processPathData( docType, data ); };
		}
		else
		{
			p.url=proxyServer;
			p.data={ q: "select * from json where url=\""+url+"\"", format: "json" };
			p.success=function(data) { processPathData( docType, !data.query.results ? null : data.query.results.json.json ); };
		}
		
		$.ajax( p );


		url = server.url + "/" + nbaServerConfig.version + "/" + docType + nbaServerConfig.metaServiceUrls.getFieldInfo

		if (server.allowCrossDomain)
		{		
			p.url=url;
			delete p.data;
			p.success=function(data) { processFieldData( docType, data ); };
		}
		else
		{
			p.url=proxyServer;
			p.data={ q: "select * from json where url=\""+url+"\"", format: "json" };
			p.success=function(data) { processFieldData( docType, !data.query.results ? null : data.query.results.json ); };
		}

		$.ajax( p );	
	}
	
	setTypeToFindPlaceholder( availableFields.length==0 ? "found no fieldnames" : "type field name" );
	setMessage( "done reading datamodels" );
	//console.dir(availableFields);
}

function bindDocumentFieldsSearchKeyUp()
{
 	$('#documentFieldsSearch').on('keyup',function()
	{

		$('#documentFieldSuggestions').toggle(false);
		
		if ($(this).val().length==0) return;
		
		findOnlyRelevantFields=$('#documentFieldsShowAll').prop('checked')==false;
		
		var s=$(this).val().toLowerCase().replace(/(\s+)/g," ").split(" ");
		var matches=[];
		var searchableFields=0;
		for (var i=0;i<availableFields.length;i++)
		{
			if (!availableFields[i].indexed && !includeNonSearchableDocumentFields) continue;
			if (findOnlyRelevantFields && service && service.document!=availableFields[i].document) continue;
			
			searchableFields++;
			
			var found=true;
			for (var j=0;j<s.length;j++)
			{
				var searchme = 
					$('#documentFieldsIncludeExtras').prop('checked') ? 
						availableFields[i].label + " " + 
							availableFields[i].type + " " + 
							(availableFields[i].indexed ? "indexed" : "not indexed") + " " + 
							(availableFields[i].allowedOperators ?  " " + availableFields[i].allowedOperators.join(" ") : "") :
						availableFields[i].searchable;
				
				if (searchme.toLowerCase().indexOf(s[j])==-1)
				{
					found=false;
				}
			}
			if (found)
			{
				matches.push(
					fetchTemplate( 'documentFieldSuggestionTpl' )
						.replace('%FIELD%',availableFields[i].field)
						.replace('%LABEL%',availableFields[i].label)
						.replace('%OPERATORS%',availableFields[i].allowedOperators ? availableFields[i].allowedOperators.join(";") : "-")
						.replace('%TYPE%',availableFields[i].type)
						.replace('%INDEXED%',availableFields[i].indexed ? "indexed" : "not indexed" )
					);
			}
		}

		setTypeToFindPlaceholder( searchableFields==0 ? "found no fieldnames" : "type field name" );
		if (matches.length==0) return;

		$('#documentFieldSuggestions').html(fetchTemplate( 'documentFieldSuggestionsTpl' ).replace('%ITEMS%',matches.join("\n")));
		$('.field-suggestion-items').on('click',function()
		{
			if (ctrlPressed)
			{
				insertStringInQueryWindow( '"'+$(this).attr('data-field')+'"' );
			}
			else
			{
				insertStringInQueryWindow( $(this).attr('data-field') );
			}
			$('#documentFieldSuggestions').toggle(false);
			if (clearFieldFindInputAfterSelect) $('#documentFieldsSearch').val("");
		});
		
		$('#documentFieldSuggestions').css({
			'position':'absolute',
			'left':  $('#documentFieldsSearch').offset().left + 'px',
			'top': $('#documentFieldsSearch').offset().top + $('#documentFieldsSearch').height() + 'px'
		});	

		$('#documentFieldSuggestions').toggle(true);
	});
	
	$(document).on('click',function()
	{
		$('#documentFieldSuggestions').toggle(false);
	});

}

function setTypeToFindPlaceholder( str )
{
	$("#documentFieldsSearch").attr("placeholder",str);
}