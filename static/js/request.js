var usePOST=false;
var useContentType;

function setRequestParameters()
{
	usePOST = $('#usePOSTmethod').is(':checked');
	useContentType = $('#contentEncoding').val();
}

function openRequest()
{
	clearResults();
	timerReset( QUERY_EXECUTION );
	timerCheckpoint( QUERY_EXECUTION, 'launch URL' );

	latestResult={};
	
	if (service.forceNewWindow)
	{
		window.open(requestUrl,'alternativeResultWindow');
		return;
	}

	if (server.proxyPath)
	{
		var directUrl=requestUrl.replace( server.url, server.nbaServer );
		createProxyRequest();
	}

	if (service.produces=='application/zip')
	{
		if (usePOST) 
		{
			setMessage( "unable to force POST", );
		}
		// console.log(requestUrl);
		timerCheckpoint( QUERY_EXECUTION, 'request response' );
		timerShow( QUERY_EXECUTION );
		$("<a>", {href: requestUrl, download: "filename.zip" }).attr("download","fuck.json").appendTo("body")[0].click();
		return;
	}
	
	if (usePOST)
	{
		if (service.method.indexOf("POST")==-1)
		{
			setMessage( "service doesn't allow POST" );
		}
		else
		{
			var u=document.createElement('a');
			u.href = requestUrl;
			requestUrl=requestUrl.replace(u.search,'');
			var parts=u.search.substring(1).split("&");
			var data={};
			for(var i=0;i<parts.length;i++)
			{
				var p=parts[i].split("=");
				data[p[0]]=decodeURIComponent(p[1]);
			}
		}
	}
	
	setResponseStatus(usePOST && service.method.indexOf("POST")!==-1 ? "POST" : "GET" );

	var p={
		url: requestUrl,
		method: "GET",
		beforeSend: function(req)
		{
			setWaitCursor(true);
			if (selectedAcceptHeaders.length>0)
			{
				req.setRequestHeader("Accept", selectedAcceptHeaders.join(","));
				setMessage( "added request header(s): " + selectedAcceptHeaders.join(",") );
			}
		},
		success: function(data, status, xhr)
		{
			timerCheckpoint( QUERY_EXECUTION, 'request response' );
			timerShow( QUERY_EXECUTION );

			setResponseStatus(xhr.status);
			
			var suppressOutput = $('#suppressOutput').is(':checked');

			var contentType=xhr.getResponseHeader("content-type").replace(/;(\s*)charset\=UTF-8/i,'');
			//console.dir(contentType);

			if ( contentType=='text/html' )
			{
				if (usePOST) 
				{
					setMessage( "unable to force POST" );
				}
				if (suppressOutput) 
				{
					setMessage( "unable to suppress output" );
				}
				bootstrapResultWindow( true );
				$( "#iframe" ).attr('src',requestUrl);
			}
			else
			if ( contentType=='text/plain' )
			{
				bootstrapResultWindow( false );

				if (suppressOutput)
				{
					setMessage("suppressed output");					
					$( "#localresults" ).html( fetchTemplate( 'responseSuccessTpl' ).replace( '%RESPONSE%', "(output suppressed)" ) );
				}
				else
				{
					$( "#localresults" ).html( fetchTemplate( 'responseSuccessTpl' ).replace( '%RESPONSE%', data ) );
				}
			}
			else
			if ( contentType!='application/json' )
			{
				if (suppressOutput)
				{
					setMessage("suppressed output");
				}
				else
				{
					window.open( requestUrl + '?__accept=' + contentType, "nbaTest" );
				}
		
				bootstrapResultWindow( false );
				$( "#localresults" ).html( fetchTemplate( 'otherFormatsMessageTpl' ).replace('%MIME%',contentType) );
			}
			else
			{
				bootstrapResultWindow( false );

				var stringified = JSON.stringify(data, undefined, 4);
				storeOutputHash(stringified);
				printOutputHashes();
				
				if (suppressOutput)
				{
					setMessage("suppressed output");					
					$( "#localresults" ).html( fetchTemplate( 'responseSuccessTpl' ).replace( '%RESPONSE%', "(output suppressed)" ) );
				}
				else
				{
					var formatted = syntaxHighlight(stringified).split("\n");

					for(var i=0;i<formatted.length;i++)
					{
						if (formatted[i].indexOf('<span')>0)
						{
							formatted[i] = formatted[i].replace('<span','<span id="rl'+i+'"');
						}
					}

					latestResult={json:data,formatted:formatted.join("\n")};

					$( "#localresults" ).html(
						fetchTemplate( 'responseSuccessTpl' )
							.replace('%RESPONSE%',latestResult.formatted)
					);
				}
			}
		},
		error: function (request, status, error)
		{
			timerCheckpoint( QUERY_EXECUTION, 'request response' );
			timerShow( QUERY_EXECUTION );
			bootstrapResultWindow( false );
			
			setMessage( "request error: " + request.status + " (" +error +")", false );
			setResponseStatus(request.status);

			try {
				var response = $.parseJSON(request.responseText);
				var errorMessage=response.exception.message;
				var errorUrl=response.requestUri;
			} catch(err) {
				//console.log(request);
				var errorMessage="request error: " + err.message;
				var errorUrl=requestUrl;
			}

			$( "#localresults" ).html( 
				fetchTemplate( 'responseErrorTpl' )
					.replace('%ERROR%',error)
					.replace('%MESSAGE%',errorMessage)
					.replace('%REQUEST_URI%',errorUrl)
			);
		},
		complete: function()
		{
			setWaitCursor(false);
		}
	};

	if (data) p.data=data;
	if (useContentType) p.contentType=useContentType;
	if (usePOST && service.method.indexOf("POST")!==-1) p.method="POST";

	$.ajax( p );	


	if ("undefined" === typeof directUrl) 
	{
		$('.resultUrl').attr("href",requestUrl);
	}
	else
	{
		$('.resultUrl').attr("href",directUrl);
	}
	
	$('.results').toggle(true);

	if (alwaysRunQueryInOwnWindow===true)
	{
		window.open(requestUrl,'alternativeResultWindow');
	}
	
}

function createProxyRequest( url )
{
	if ( url!=undefined && url.length>0 )
	{
		return server.url + server.proxyPath + encodeURIComponent( url.replace( server.url, "") );
	}
	else
	{
		requestUrl = server.url + server.proxyPath + encodeURIComponent( requestUrl.replace( server.url, "") );
	}
}
