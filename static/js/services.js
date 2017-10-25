var services=[];
var documentTypes=[];
var serviceIndex=[];

function getServices()
{
	services.length=0;

	if (server==undefined) return;
	if (server.noServices==true) return;

	serviceIndex=[];

	var url = server.url+"/"+nbaServerConfig.version+nbaServerConfig.metaServiceUrls.restServices
	if ( server.proxyPath )
	{
		url=createProxyRequest( url );
	}
	
	var p={
		dataType: "json",
		async: false,
		error: function (request, status, error)
		{
			//setMessage( request.responseText );
			setMessage( "unable to retrieve services ("+error+")", false );
			useBackupServiceList();
		},
		complete: function () {}
	};
	
	setMessage( "accessing service list" );
	p.url=url;
	p.success=function(data) { processServiceData( data ); };
	
	servicesFinishedLoading=false;

	$.ajax( p );
		
	function serviceSort(a,b)
	{
		if (a.sort < b.sort) return -1;
		if (a.sort > b.sort) return 1;

		if (a.path < b.path) return -1;
		if (a.path > b.path) return 1;

		return 0;
	}

	services.sort(serviceSort);
}

function processServiceData( data )
{
	usingDefaultRestServiceLists=false;
	
	if (!data) 
	{
		setMessage( "unable to retrieve services", false );
		useBackupServiceList();
	}
	else
	{
		var serviceList=data;
		processServiceList( serviceList );
		setMessage( "read all services" );
	}
}

function processServiceList( serviceList )
{
	for(var i=0;i<serviceList.length;i++)
	{
		var f = parseService( serviceList[i] );
		if ( f )
		{
			if (serviceIndex.indexOf(f.key)==-1)
			{
				services.push( f );
				serviceIndex.push( f.key );
			}
			else
			{
				for(var j=0;j<services.length;j++)
				{
					if (services[j].key==f.key)
					{
						services[j].method=arrayUnique(services[j].method.concat( f.method ));						
					}
				}
			}
			
			if ( f.hasQuerySpec )
			{
				// clone object and make it into a 'human readable' service
				var copy=jQuery.extend({}, f);
				copy.path=copy.path.replace("_querySpec=","");
				copy.key=copy.path.trim().hashCode();
				copy.encodeQuery=false;
				copy.label=copy.label+ " (human readable)";
				copy.sort=copy.sort+"x";
				copy.default=false;
				delete copy.hasQuerySpec;
				if (serviceIndex.indexOf(copy.key)==-1)
				{
					services.push( copy );
					serviceIndex.push( copy.key );
				}			
			}
		}			
	}
}

function parseService( s )
{
	var pathParts=s.endPoint.trim().split("/");
	pathParts.shift(); // first element always empty
	var	firstPart=pathParts.shift();
	
	if (firstPart.length>0 && nonDocumentPathRoots.indexOf(firstPart)==-1)
	{
		// actual document type
		var documentType=firstPart;
	}
	else
	if (firstPart=="metadata")
	{
		var documentType=".metadata";
	}
	else
	{
		// ping, release-notes (& root)
		var documentType=".system";
	}

	// global documentTypes
	if (documentType.substr(0,1)!="." && documentTypes.indexOf(documentType)==-1) documentTypes.push(documentType);

	var path = "/"+nbaServerConfig.version+s.endPoint.trim().replace(/{(.*)}$/,'');

	var lastPart=pathParts.pop();
	var	secondPart=pathParts.shift();

	
	if (secondPart=="save") return;
	
	if (documentType.substr(0,1)==".")
	{
		var noQuery=true;
	}
	else
	if (lastPart && (lastPart=="query" || lastPart=="querySpecial" || lastPart=="count" || lastPart=="groupByScientificName"))
	{
		path=path+"/?_querySpec=";
		var hasQuerySpec=true;
	}
	else
	if (lastPart && lastPart.substr(0,1)==lastPart.substr(0,1).toUpperCase())
	{
		// PhaseOrStage etc -> controlled lists
		var noQuery=true;
	}
	else
	if (lastPart && lastPart.substr(0,3)=="get" && (lastPart.substr(3,1)==lastPart.substr(3,1).toUpperCase()))
	{
		var noQuery=true;
	}
	
	if (lastPart && lastPart.substr(0,1)=="{" && lastPart.substr(-1)=="}")
	{
		var noQuery=false;
	}
	
	var sort="";
	if (documentType=="specimen") sort="a";
	if (documentType=="taxon") sort="b";
	if (documentType=="multimedia") sort="c";
	if (documentType=="names") sort="d";
	if (documentType=="geo") sort="e";
	if (documentType==".metadata") sort="x";
	if (documentType==".system") sort="z";
	
	var f=[
		{ path: '/metadata/', sort: 70 },
		{ path: '/dwca/', sort: 60 },
		{ path: '/find/', sort: 40 },
		{ path: '/find', sort: 50 },
		{ path: '/count/', sort: 30 },
		{ path: '/get', sort: 20 },
		{ path: '/querySpecial/', sort: 10 },
		{ path: '/query/', sort: 0 },
	]

	var x="";
	for(var i=0;i<f.length;i++)
	{
		if (path.indexOf(f[i].path)!=-1)
		{
			x=f[i].sort;
			break;
		}
	}
	
	sort=sort + (x.length==0 ? "z" : x);

	var service = {
		document: documentType,
		label: "/"+nbaServerConfig.version+s.endPoint,
		path: path,
		method: [ s.method ],
		sort: sort,
		default: (sort=="a0" && hasQuerySpec)
	};
	
	if (noQuery) service.noQuery=noQuery;
	if (hasQuerySpec) service.hasQuerySpec=hasQuerySpec;
	if (s.consumes) service.consumes=s.consumes;
	if (s.produces) service.produces=s.produces;
	//service.encodeQuery=!noQuery;
	service.encodeQuery=hasQuerySpec;
	
	service.key=service.path.trim().hashCode();

	return service;
}

function useBackupServiceList()
{
	var backupServiceList = getDefaultRestServiceLists();

	if (backupServiceList===false)
	{
		return;
	}
	else
	{
		setMessage( "using default service list", false );
		var serviceList=backupServiceList;
		usingDefaultRestServiceLists=true;
		processServiceList( serviceList );
		setMessage( "read all services (using default service list)"  );
	}
}

function addStaticServices()
{
	if ("undefined" === typeof staticServices) return;
	services = services.concat(staticServices);
}

function populateServices()
{
	$('#services').find('option').remove();

	for(var i=0;i<services.length;i++)
	{
		services[i].index=i;
		var s=services[i];

		if (i==0)
		{
			$('#services').append(fetchTemplate( 'serviceDisabledTpl' ).replace('%LABEL%',s.document));
		}
		else
		if (s.document!=services[i-1].document)
		{
			$('#services').append(fetchTemplate( 'serviceDisabledTpl' ).replace('%LABEL%',''));
			$('#services').append(fetchTemplate( 'serviceDisabledTpl' ).replace('%LABEL%',s.document));
		}
		
		if (s.path)
		{
		    $('#services').append(
				fetchTemplate( 'serviceTpl' )
					.replace('%INDEX%',s.index)
					.replace('%SELECTED%',(s.default ? ' selected="selected"' : '' ))
					.replace('%PATH%',s.path)
					.replace('%LABEL%',s.label && s.label!=s.path ? ' ['+s.label+']' : '' )
					.replace('%ENCODED%',(s.encodeQuery ? ' &percnt;' : '' ))
					.replace('%NO_QUERY%',(s.noQuery ? ' -' : '' ))
					.replace('%ORIGIN%',(usingDefaultRestServiceLists ? '   &lt;read from default service list&gt;' : '' ))
				);

			services[i].hashCode=s.path.trim().hashCode();
		}
	}
	
	if ($('#services option').length==0)
	{
		$('#services').append(fetchTemplate( 'serviceDisabledTpl' ).replace('%LABEL%','found no services'));
	}
}

function checkForDefaultRestServiceList()
{
	if ("undefined" === typeof getDefaultRestServiceLists) return false;
	return getDefaultRestServiceLists();
}