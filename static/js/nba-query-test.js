var application = {
	name: "Query scratchpad for the Netherlands Biodoversity API", //"NBAv2 REST query tool",
	version: "2.x", // version is retrieved from version history table
	date: "2017", // date retrieved from version history table
	author: "maarten schermer",
	email: "maarten.schermer@naturalis.nl",
}
var query="";
var queryEncoded="";
var requestUrl="";
var queryIndex=[];
var activeQuery="";
var oldNotes="";
var initialNote=true;
var server={};
var service={};
var prevService={};
var newQueryIndex="";
var commentCharacters=["#","//"];
var defaultCommentCharIndex=1;
var removeEmptyLines=true;
var doNotVerifyQueryJson=false;
var replaceEmptyQueryWithBrackets=true;
var fieldSeparator=String.fromCharCode(23);
var saveServiceWithQuery=true;
var ctrlPressed=false;
var shiftPressed=false;
var noExampleQueries=false;
var alwaysRunQueryInOwnWindow=false;
var findOnlyRelevantFields=true;
var clearFieldFindInputAfterSelect=true;
var includeNonSearchableDocumentFields=false;
var startSelectedServiceIndex;
var availableFields=[];
var usingDefaultRestServiceLists=false;
var lastLoadedSavedQueryName="";
var latestResult={};
var selectedAcceptHeaders=[];

function setFixedServer( p )
{
	p.url.replace(/\/$/,"");
	p.label = p.url
	p.testpath = p.nbaServer + "/v2/"
	p.noServices = false;
	p.allowCrossDomain = true;
	p.directNbaPath=p.nbaServer + "/v2/";
	server=p;
	$('#servers').html( p.url );
}

function setService()
{
	service=findService($("#services").val());
}

function setServerStatusLink()
{
	if (server==undefined) return;
	$('#serverStatus').attr("href",server.testpath).toggle(( typeof server.testpath == 'string' ));
}

function setServerSelectTitle()
{
	if (server==undefined) return;
	$('#servers').attr("title",server.url);
}

function findItem( array, index )
{
	for(var i=0;i<array.length;i++)
	{
		if (index==array[i].index)
		{
			return array[i];
		}
	}
}

function findServer(index)
{
	return findItem(servers,index);
}

function findService(index)
{
	return findItem(services,index);
}

function getServiceByHashCode( hashCode )
{
	for(var i=0;i<services.length;i++)
	{
		if (services[i].hashCode==hashCode)
		{
			return services[i];
		}
	}
}

function selectServiceByHashCode( hashCode )
{
	var s=getServiceByHashCode(hashCode);
	if (s)
	{
		$('#services').val(s.index).trigger('change');
	}
}

function rememberSelectedService()
{
	prevService=service;
}

function recallSelectedService()
{
	service=prevService;
	if (service==undefined) return;
	selectServiceByHashCode( service.hashCode );
}

function findQueryNumber( index )
{
	index = "query:" + index.replace(/^query:/,"");

	for(var i=0;i<queryIndex.length;i++)
	{
		if (index==queryIndex[i])
		{
			return i;
		}
	}
}

function displayFullUrl()
{
	if (server && service && server.url && service.path)
	{
		$("#resultQuery").val(server.url+service.path);
	}
	else
	{
		$("#resultQuery").val('error');
		setMessage("couldn't get service or service.path",false);
	}
}

function encodeQuery()
{
	queryEncoded=rawurlencode(query.replace(/(\n|\r)/," ").trim());
}

function getRequestUrl()
{

	if(service.forceNewWindow)
	{
		var serverUrl = server.nbaServer;	
	}
	else
	{
		var serverUrl = server.url;			
	}

	if (service.port)
	{
		var u=document.createElement('a');
		u.href = server.url;
		if (u.port)
		{
			var baseurl = serverUrl.replace(":"+u.port,":"+service.port)
		}
		else
		{
			var baseurl = serverUrl.trim().replace(/\/$/, "") + ":"+service.port;
		}
	}
	else
	{
		var baseurl = serverUrl;
	}

	return baseurl + ( service.pathExtended ? service.pathExtended : service.path ) + ( service.noQuery ? '' : ( service.encodeQuery ? queryEncoded : query ));
}

function makeRequest()
{
	setService();

	if (!server) return;
	if (!service) return;
	
	requestUrl=getRequestUrl();

	$("#resultQuery").val(requestUrl);
}
					
function setResponseStatus(status)
{
	$('#serverResponseCode').html(status);
}

function setCustomRequest()
{
	requestUrl=$('#resultQuery').val().trim();
}

function clearResults()
{
	$('#iframe').attr("src","");
	$('#localresults').html("");
}

function newWindow()
{
	window.open(requestUrl,"nbaOutput");
}

function setMessage( msg, fadeOut )
{
	$('#message').stop(true,true);

	if (!msg)
	{
		$('#message').fadeOut(100);
	}
	else
	if (fadeOut===false)
	{
		$('#message').toggle(true).html(msg);
		$('#message').append(fetchTemplate('messageCloseTpl'));
	}
	else
	{
		$('#message').toggle(true).html(msg).fadeOut(fadeOut ? fadeOut : 2000);
	}	
}

function saveQuery()
{
	var index=$('#queryName').val().trim();
	if (index.length==0)
	{
		setMessage("need a query name");
		return;
	}
	
	index=htmlEncode(index);

	var query=$('#query').val().trim();
	if (query.length==0)
	{
		setMessage("need a query");
		return;
	}

	newQueryIndex="query:"+index;
	saveServiceWithQuery=$('#saveWithService').is(':checked');

	if (saveServiceWithQuery && service.hashCode)
	{
		query+=fieldSeparator+service.hashCode;
	}

	$.jStorage.set(newQueryIndex,query);
	setMessage("saved '" + index + "'");
	$('#queryName').val("");
}

function saveQueryViaKeyboard(e)
{
	if ($('#enableCtrlS').is(':checked'))
	{
		e.preventDefault();
		
		if ($('.queryHighlight').length>0)
		{
			var name = queryIndex[$('.queryHighlight').first().attr("data-number")].replace(/^query:/,"");
			//var backup=getStoredItem('query:'+name).split(fieldSeparator);
			$('#queryName').val(name);
			saveQuery()		
		}
	}
}
			
function getQueryIndex()
{
	queryIndex.splice(0,queryIndex.length);
	var allItems=$.jStorage.index();
	for(var i=0;i<allItems.length;i++)
	{
		if (allItems[i].indexOf("query:")==0)
		{
			queryIndex.push(allItems[i]);
		}
	}
}

function getStoredItem( key, def )
{
	return $.jStorage.get(key,def)
}

function matchGroupName(q)
{
	return q.match(/\[(.*)\]/);
}

function drawQueryIndex()
{
	$('#queries').empty();
	for(var i=0;i<queryIndex.length;i++)
	{
		var q=queryIndex[i].replace(/^query:/,"");
		var matches = matchGroupName(q);
		var t=getStoredItem(queryIndex[i]).split(fieldSeparator);
		var n=getStoredItem("notes:"+q,"");

		if(t[1])
		{
			var s=getServiceByHashCode(t[1]);
		}
		else
		{
			var s=false;
		}

		if (matches)
		{
			var groupName=matches[0];
			var hashCode=groupName.hashCode();

			if (q.replace(groupName,"").trim().length==0)
			{
				q=i;
			}

			if (!$('#group-'+hashCode).length)
			{
				$('#queries').append(fetchTemplate( 'groupTpl' ).replace(/%TITLE%/g,groupName.replace(/^\[/,"").replace(/\]$/,"")).replace(/%HASH%/g,hashCode));
			}

			$('#group-'+hashCode)
				.append(fetchTemplate( 'queryTpl' )
					.replace(/%NUMBER%/g,i)
					.replace('%TITLE%',q).replace(groupName,"").trim()
					.replace('%SERVICE%',s ? " service '"+s.label+"'" : "out service")
					.replace('%ARROW%',s ? fetchTemplate( 'useQuerySymbolAndServiceTpl' ) : fetchTemplate( 'useQuerySymbolTpl' ))
					.replace('%NOTES%',n ? fetchTemplate( 'noteSymbolTpl' ) : fetchTemplate( 'emptyNoteSymbolTpl' ))
					.replace('%NOTE_CHAR_COUNT%',n ? ' ('+n.length+')' : '' )
			);
		}
		else
		{
			$('#queries')
				.append(fetchTemplate( 'queryTpl' )
					.replace(/%NUMBER%/g,i)
					.replace('%TITLE%',q)
					.replace('%SERVICE%',s ? " service '"+s.label+"'" : "out service")
					.replace('%ARROW%',s ? fetchTemplate( 'useQuerySymbolAndServiceTpl' ) : fetchTemplate( 'useQuerySymbolTpl' ))
					.replace('%NOTES%',n ? fetchTemplate( 'noteSymbolTpl' ) : fetchTemplate( 'emptyNoteSymbolTpl' ))
					.replace('%NOTE_CHAR_COUNT%',n ? ' ('+n.length+')' : '' )
				);
		}
	}

	$('.group').on('click',function(event) { $('#group-'+$(this).attr('data-id')).toggle(); });

	$('ul[id^=group-]').each(function(index, element)
	{
		$('#'+$(this).attr('id').replace('group-','count-')).html($(this).children().length);
    });
}

function useQuery( number )
{
	var t=getStoredItem(queryIndex[number]).split(fieldSeparator);
	$('#query').val(t[0]);
	if (t[1])
	{
		selectServiceByHashCode(t[1]);
	}
	lastLoadedSavedQueryName=queryIndex[number].replace(/^query:/,"");
}

function removeQueryHighlight()
{
	$('.query').removeClass('queryHighlight');
}

function highlightQuery( number )
{
	removeQueryHighlight();
	$('#query-'+number).addClass('queryHighlight');
	$('#query-'+number).addClass('queryHighlight');
}

function highlightFreshQuery()
{
	highlightQuery(findQueryNumber(newQueryIndex));
	var matches = matchGroupName(newQueryIndex);
	if (matches)
	{
		$('#group-'+matches[0].hashCode()).toggle(true);
	}
}

function deleteQuery(number)
{
	if (confirm("are you sure?"))
	{
		$.jStorage.deleteKey(queryIndex[number]);
		$.jStorage.deleteKey(queryIndex[number].replace(/^query:/,"notes:"));
		setMessage("deleted '" + queryIndex[number].replace(/^query:/,"") + "'");
		getQueryIndex();
		checkExampleQueries();
		drawQueryIndex();
	}
}

function useQueryName(number)
{
	$('#queryName').val(htmlDecode(queryIndex[number].replace(/^query:/,"")));
}

function useGroupName(name)
{
	$('#queryName').val('[' + name + '] ');
}

function queryNameInputFocus()
{
	$('#queryName').val($('#queryName').val());
	$('#queryName').focus();
}

function checkExampleQueries()
{
	if (noExampleQueries) return;
	if (queryIndex.length>0) return;

	for(var i=0;i<queryIndex.length;i++)
	{
		if (queryIndex[i]=="query:example query") {
			return;
		}
	}

	$.jStorage.set("query:example specimen query (complex)",fetchTemplate( 'exampleQueryComplexTpl' ).trim());
	$.jStorage.set("query:example taxon query (human readable)",fetchTemplate( 'exampleQueryHrTpl' ).trim());
	setMessage("added example queries");
	getQueryIndex();
}

function helpToggle()
{
	$('#helpDiv').toggle();
}

function linksToggle()
{
	$('#linksDiv').toggle();
}

function checkSaveWithServiceToggle()
{
	$('.save-with-service.check-box-label-off').css('display',$('#saveWithService').is(':checked') ? 'inline-block' : 'none');
	$('.save-with-service.check-box-label-on').css('display',$('#saveWithService').is(':checked') ? 'none' : 'inline-block');
}

function checkDocumentFieldsIncludeExtras()
{
	$('.document-fields-include-extras.check-box-label-off').css('display',$('#documentFieldsIncludeExtras').is(':checked') ? 'inline-block' : 'none');
	$('.document-fields-include-extras.check-box-label-on').css('display',$('#documentFieldsIncludeExtras').is(':checked') ? 'none' : 'inline-block');
}

function checkDocumentFieldsShowAll()
{
	$('.document-fields-show-all.check-box-label-off').css('display',$('#documentFieldsShowAll').is(':checked') ? 'inline-block' : 'none');
	$('.document-fields-show-all.check-box-label-on').css('display',$('#documentFieldsShowAll').is(':checked') ? 'none' : 'inline-block');
}

function enableCtrlSToggle()
{
	$('.enable-ctrl-s.check-box-label-off').css('display',$('#enableCtrlS').is(':checked') ? 'inline-block' : 'none');
	$('.enable-ctrl-s.check-box-label-on').css('display',$('#enableCtrlS').is(':checked') ? 'none' : 'inline-block');
}

function usePOSTmethodToggle()
{
	$('.enable-post.check-box-label-off').css('display',$('#usePOSTmethod').is(':checked') ? 'inline-block' : 'none');
	$('.enable-post.check-box-label-on').css('display',$('#usePOSTmethod').is(':checked') ? 'none' : 'inline-block');
}

function suppressOutputToggle()
{
	$('.suppress-output.check-box-label-off').css('display',$('#suppressOutput').is(':checked') ? 'inline-block' : 'none');
	$('.suppress-output.check-box-label-on').css('display',$('#suppressOutput').is(':checked') ? 'none' : 'inline-block');
}

function autoPullQueryTrigger()
{
	if (ctrlPressed)
	{
		$( '#query-trigger' ).trigger( 'click' );
	}
}

function switchServerIndex( up )
{
	$('#servers :nth-child('+(($("#servers").prop('selectedIndex') + (up==false ? 1 : -1))+1)+')').prop('selected', true);
	$('#servers').trigger('change');
}

function switchServiceIndex( up )
{
	$('#services :nth-child('+(($("#services").prop('selectedIndex') + (up==false ? 1 : -1))+1)+')').prop('selected', true);
	$('#services').trigger('change');
}

function closeQueryWindowContextMenu()
{
	$('#queryWindowContextMenu').toggle(false);
}

function timerToggle()
{
	$('.timer').toggle(!timerVisible);
	timerVisible=!timerVisible;
	clearTimer();
	setMessage('timer ' + (timerVisible ? 'on' : 'off') );	
}

function addAcceptHeader(custom)
{
	var t=custom ? $('#customAcceptHeader').val().trim() : $('#purlAcceptHeaders :selected').val();
	if (selectedAcceptHeaders.indexOf( t )<0) selectedAcceptHeaders.push( t );
}

function drawAcceptHeaderString()
{
	$('#purlAcceptHeaderString').html(selectedAcceptHeaders.join(","));
	$('.clear-accept-headers').toggle(selectedAcceptHeaders.length>0);
	$('.clear-accept-headers').toggle(selectedAcceptHeaders.length>0);
}

function setWaitCursor( state )
{
	if (state)
	{
		$('body').css('cursor','wait');
	}
	else
	{
		$('body').css('cursor','default');
	}
}

function peripheralCleaning()
{
	setMessage();
	clearJSONpathResults();
	$('#resultSearch').val("");
}

function runQuery()
{
	tidyQueryWindow();
	fixEmptyQuery();
	readQuery();
	parseRESTparamsFromQueryWindow();

	if (doNotVerifyQueryJson || queryVerifyJsonValidity())
	{
		peripheralCleaning();
		encodeQuery();
		makeRequest();
		setRequestParameters();
		openRequest();
	}
}
