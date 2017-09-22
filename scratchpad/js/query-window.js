function clearQuery()
{
	$("#query").val("");
}

function tidyQuerystring( raw )
{
	// remove superfluous comma's (result from code-snippet insert)
	return raw.replace(/(,)(\s*)([\]\}])/g, function(match, p1, p2, p3, offset, string)
    {
       return p2+p3;
    });
}

function tidyQueryWindow()
{
	var t=$('#query').val();
	t=tidyQuerystring( t )
	$('#query').val( t );
}

function fixEmptyQuery()
{
	if 	(!replaceEmptyQueryWithBrackets) return;
	
	var t=removeQueryComments( $('#query').val() ).trim();

	if (t.length==0 && service.encodeQuery)
	{
		$('#query').val( fetchTemplate('emptyQueryTpl') );
	}
	else
	if (t==fetchTemplate('emptyQueryTpl') && !service.encodeQuery)
	{
		$('#query').val( "" );
	}
}

function showCaretPosition()
{
	var matches=[];
	matches=findAllSubstrings($('#query').val(),"\n",0,matches);
	matches.push($('#query').val().length);

	var line=0;
	var pos=0;
	var tPos=$('#query').prop("selectionStart");
	
	for(var i=0;i<matches.length;i++)
	{
		line=i;
		pos=tPos-(i==0?0:matches[i-1]);
		if (tPos<=matches[i]) break
	}
	$('#cursor-position').html( fetchTemplate('cursorPositionTpl').replace('%LINE%',line+1).replace('%POS%',pos));
}
	
function decodeQuery()
{
	$('#query').val(decodeURIComponent($('#query').val()));
}

function insertStringInQueryWindow( str )
{
    var startPos = $('#query').prop('selectionStart');
    var endPos = $('#query').prop('selectionEnd');
	if (startPos!=endPos)
	{
		$('#query').val( $('#query').val().substring(0,startPos)+$('#query').val().substring(endPos) );
	}
	var val = $('#query').val();
	$('#query').val(val.substring(0,startPos) + str + val.substring(startPos,val.length));
	$('#query').focus();
	$('#query').selectRange(startPos+str.length);
}

function insertOperator( ele )
{
	insertStringInQueryWindow( $( ele ).attr("value") );
}

function insertCodeBit( ele )
{
	insertStringInQueryWindow( codeBits[$( ele ).attr("value")].code + "\n" );
}

function copySelectedTextInQueryWindow()
{
    var startPos = $('#query').prop('selectionStart');
    var endPos = $('#query').prop('selectionEnd');
	if (startPos!=endPos)
	{
		return $('#query').val().substring(startPos,endPos);
	}
	return "";
}

function cutSelectedTextFromQueryWindow()
{
	var s=copySelectedTextInQueryWindow();
    var startPos = $('#query').prop('selectionStart');
    var endPos = $('#query').prop('selectionEnd');
	if (startPos!=endPos)
	{
		$('#query').val( $('#query').val().substring(0,startPos)+$('#query').val().substring(endPos) );
	}
	return s;
}

function addSlashes()
{
    var startPos = $('#query').prop('selectionStart');
    var endPos = $('#query').prop('selectionEnd');
	if (startPos!=endPos)
	{
		var str =$('#query').val().substring(startPos,endPos);
		if ( ctrlPressed )
		{
			insertStringInQueryWindow( str.replace(/"/g, '\\"').replace(/\n/g, '').replace(/(\s)+/g, ' ') );
		}
		else
		if ( shiftPressed )
		{
			insertStringInQueryWindow( str.replace(/\\"/g, '"') );
		}
		else
		{
			insertStringInQueryWindow( str.replace(/"/g, '\\"') );
		}
	}
}

function queryWindowRemoveCommentChars()
{
	insertStringInQueryWindow(removeCommentCharFromText(copySelectedTextInQueryWindow(),commentCharacters[defaultCommentCharIndex]));
}

function queryWindowAddCommentChars()
{
	insertStringInQueryWindow(addCommentCharToText(copySelectedTextInQueryWindow(),commentCharacters[defaultCommentCharIndex]));
}

function queryWindowAddDoubleQuotes()
{
	insertStringInQueryWindow(doubleQuoteText(copySelectedTextInQueryWindow()));
}

function queryWindowCopyString()
{
	var s=copySelectedTextInQueryWindow();
	copyToClipboard(s);
	setMessage('copied string to clipboard');
}			

function queryWindowCutString()
{
	var s=cutSelectedTextFromQueryWindow();
	copyToClipboard(s);
	setMessage('cut string to clipboard');
}			

function queryWindowSearchGoogle()
{
	if (googleUrl==undefined) return;
	var s=copySelectedTextInQueryWindow();
	window.open(googleUrl.replace('%SEARCH%',s),'_blank');
}

function copyQueryToClipboard()
{
	copyToClipboard($('#query').val().trim());
}

function copyJIRAQueryToClipboard()
{
	copyToClipboard(fetchTemplate( 'jiraNoFormatTpl' ).replace('%QUERY%',$('#query').val().trim()).trim());
}

function copyCompleteRequestToClipboard()
{
	readQuery();
	encodeQuery();
	copyToClipboard(
		fetchTemplate( 'completeRequestExportTpl' )
			.replace('%SERVER%',server.url)
			.replace('%SERVICE%',service.path)
			.replace('%SERVICE_LABEL%',service.label)
			.replace('%QUERY%',$('#query').val())
			.replace('%URL%',getRequestUrl())
	);
}

function removeQueryComments( str )
{
	var d=str.split("\n");
	var r=[];
	for(var i=0;i<d.length;i++)
	{
		if (removeEmptyLines && d[i].trim().length==0)
		{
			continue;
		}

		var isComment=false;
		for(var j=0;j<commentCharacters.length;j++)
		{
			if (d[i].trim().indexOf(commentCharacters[j])===0)
			{
				isComment=true;
			}
		}
		if (!isComment) r.push(d[i]);
	}
	return r.join("\n");
}

function readQuery()
{
	query=$("#query").val().trim();
	query=removeQueryComments( query );
}

function queryVerifyJsonValidity()
{
	if (query.length==0) return true; // empty query
	if (query.indexOf('{')==-1 && query.indexOf('}')==-1) return true; // HR query

	try {
		var t=tidyQuerystring( query );
		removeQueryComments( t )
		$.parseJSON( t );
		setMessage();
		return true;
	} 
	catch(ex)
	{
		clearResults();	
		setMessage( ex.message.replace("SyntaxError:","").replace("JSON.parse:",""), false );	
		return false;
	}
}
