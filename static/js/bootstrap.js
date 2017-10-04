var queryWindowContextmenuActive=false;
var activeWindowType;

function setApplicationInfo()
{
	var versionInfo=$('#version-history li').last().html().trim().split(":").shift().split(" ",2).map(function(e,i){ return e.replace(/(\(|\)|\s)/gi,""); });

	$('title').html(application.name);
	$('.appName').html(application.name);
	$('.appVersion').html(versionInfo[0] ? versionInfo[0] : application.version);
	$('.appDate').html(versionInfo[1] ? versionInfo[1] : application.date);
	$('.appAuthor').html(application.author);
	$('.appEmail').attr("href","mailto:"+application.email);
}

function checkMinimalRequirements()
{
	var buffer=[];

	if ("undefined" === typeof servers) buffer.push("server defintion is missing");
	if ("undefined" === typeof nbaServerConfig) buffer.push("NBA server settings are missing");
	if ("undefined" === typeof nonDocumentPathRoots) buffer.push("non-document path root configuration is missing");
	
	if (buffer.length==0) return true;

	buffer.unshift("fatal error(s):");
	alert(buffer.join("\n"));

	return false;
}

function bootstrapQueryWindowContextmenu()
{
	$('#query').on('contextmenu',function(e)
	{
		e.preventDefault();

		var main=[];
		var sub=[];

		main.push(
			fetchTemplate( 'queryContextMainItemTpl' )
				.replace(/%LOCAL_ID%/gm,main.length)
				.replace('%LABEL%','edit')
				.replace('%TITLE%','edit')
		);

		/* context edit menu */
		var buffer=[];
		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','copy')
				.replace('%TITLE%','copy')
				.replace('%ONCLICK%','queryWindowCopyString();closeQueryWindowContextMenu();')
		);
		
		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','cut')
				.replace('%TITLE%','cut')
				.replace('%ONCLICK%','queryWindowCutString();closeQueryWindowContextMenu();')
		);

		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','clear')
				.replace('%TITLE%','clear')
				.replace('%ONCLICK%','clearQuery();closeQueryWindowContextMenu();')
		);		
	
		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','apply comment')
				.replace('%TITLE%','apply comment')
				.replace('%ONCLICK%','queryWindowAddCommentChars();closeQueryWindowContextMenu();')
		);		

		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','remove comment')
				.replace('%TITLE%','remove comment')
				.replace('%ONCLICK%','queryWindowRemoveCommentChars();closeQueryWindowContextMenu();')
		);		
		
		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','add slashes')
				.replace('%TITLE%','add slashes')
				.replace('%ONCLICK%','addSlashes();closeQueryWindowContextMenu();')
		);		
		
		buffer.push(
			fetchTemplate( 'editContextTpl' )
				.replace('%LABEL%','add double quotes')
				.replace('%TITLE%','add double quotes')
				.replace('%ONCLICK%','queryWindowAddDoubleQuotes();closeQueryWindowContextMenu();')
		);		
		
		if (googleUrl!=undefined)
		{
			buffer.push(
				fetchTemplate( 'editContextTpl' )
					.replace('%LABEL%','search in Google')
					.replace('%TITLE%','search in Google')
					.replace('%ONCLICK%','queryWindowSearchGoogle();closeQueryWindowContextMenu();')
			);		
		}
		
		sub.push(
			fetchTemplate( 'queryContextItemsTpl' )
				.replace(/%LOCAL_ID%/gm,main.length-1)
				.replace('%ITEMS%',buffer.join("\n"))
		);		

		var buffer=[];
		for(var i=0;i<queryOperators.length;i++)
		{
			buffer.push( fetchTemplate( 'queryOperatorContextTpl' ).replace(/%OPERATOR%/g,queryOperators[i]));
		}
		
		main.push(
			fetchTemplate( 'queryContextMainItemTpl' )
				.replace(/%LOCAL_ID%/gm,main.length)
				.replace('%LABEL%','operator')
				.replace('%TITLE%','insert logical operator')
		);

		sub.push(
			fetchTemplate( 'queryContextItemsTpl' )
				.replace(/%LOCAL_ID%/gm,main.length-1)
				.replace('%ITEMS%',buffer.join("\n"))
		);

		var buffer=[];
		for(var i=0;i<codeBits.length;i++)
		{
			if (codeBits[i].code)
			{
				buffer.push(fetchTemplate( 'codeBitContextTpl' ).replace('%I%',i).replace('%LABEL%',codeBits[i].label));
			}
			else
			{
				buffer.push(fetchTemplate( 'codeBitContextHeaderTpl' ).replace('%LABEL%',codeBits[i].label));
			}
		}
		
		main.push(
			fetchTemplate( 'queryContextMainItemTpl' )
				.replace(/%LOCAL_ID%/gm,main.length)
				.replace('%LABEL%','code')
				.replace('%TITLE%','insert code')
		);

		sub.push(
			fetchTemplate( 'queryContextItemsTpl' )
				.replace(/%LOCAL_ID%/gm,main.length-1)
				.replace('%ITEMS%',buffer.join("\n"))
		);
	
		$('#queryWindowContextMenu')
			.css({
				'position':'absolute',
				'left':  (e.pageX+5) + 'px',
				'top': (e.pageY+10) + 'px'
			})
			.html( 
				main.join(" | ")  + sub.join("")
			)
			.toggle(true);	

	});

	queryWindowContextmenuActive=true;
	setMessage('query window context menu on');
}

function bootstrapResultWindow( forceIframe )
{
	if (server.allowCrossDomain && !forceIframe )
	{
		if (activeWindowType=='localresults') return;

		$('#iframe').off('load');
		$('#iframe').toggle(false);
		$('.localresults').toggle(true);
		activeWindowType='localresults';
	}
	else
	{
		if (activeWindowType=='iframe') return;

		$('.localresults').toggle(false);
		$('#iframe').toggle(true);
		$('#iframe').on('load',function() { timerCheckpoint( QUERY_EXECUTION, 'iframe onLoad' );timerShow( QUERY_EXECUTION ); } );
		activeWindowType='iframe';
	}
}

function bootstrapQueryWindow()
{
	bootstrapQueryWindowContextmenu();

	$('#query').on('click',function(e)
	{
		closeQueryWindowContextMenu();
	});

	$('#query').on('keyup',function(e)
	{
		 showCaretPosition();		

		if (e.keyCode==122 && ctrlPressed && shiftPressed) // ctrl+shift+F11
		{
			queryWindowRemoveCommentChars();
		}
		else
		if (e.keyCode==122 && ctrlPressed) // ctrl+F11
		{
			queryWindowAddCommentChars();
		}
		else
		if (e.keyCode==123 && ctrlPressed) // ctrl+F12
		{
			queryWindowAddDoubleQuotes();
		}
		else
		if (e.keyCode==32 && ctrlPressed) // ctrl+space
		{
			insertStringInQueryWindow( String.fromCharCode(32).repeat(ctrlSpaceNumberOfSpaces ? ctrlSpaceNumberOfSpaces : 2) );
		}
	})
	.on('keydown',function(e)
	{
		 showCaretPosition();	
	})
	.on('mouseup',function(e)
	{
		 showCaretPosition();	
	});

	$('#cursor-position').html( fetchTemplate('cursorPositionTpl').replace('%LINE%',0).replace('%POS%',0) );
}

function bootstrapSupportWindows()
{
	// specific override for iframe
	var prevColor;

	$('#helpDiv b').each(function()
	{
		$(this).on('mousedown',function()
		{
			var label=$(this).html().toLowerCase();
			
			// specific overrides for iframe
			prevColor=$('[title="'+label+'"]').css('background-color');
			$('[title="'+label+'"]').css('background-color','');
		
			$('[title="'+label+'"]').addClass('helpHighlight');
			$('[alt-title="'+label+'"]').addClass('helpHighlight');
		});
		$(this).on('mouseup',function()
		{
			var label=$(this).html().toLowerCase();

			$('[title="'+label+'"]').removeClass('helpHighlight');
			$('[alt-title="'+label+'"]').removeClass('helpHighlight');

			// specific override for iframe
			$('[title="'+label+'"]').css('background-color',prevColor);
		});
	});

	$( '#exampleCommentChars' ).html('<code>'+commentCharacters.join('</code>,<code>')+'</code>');
	
	$( '.active-comment-char' ).html(commentCharacters[defaultCommentCharIndex]);
	$( '.ctrl-space-number-of-spaces' ).html(ctrlSpaceNumberOfSpaces);

	$( '#notesDiv' ).draggable({ handle: '#notesName' });
	$( '#helpDiv' ).draggable({ handle: '#helpHeader' });
	
	$( '.directNbaPath' ).html(server.directNbaPath).attr("href",server.directNbaPath);

}

function bindKeys()
{
	$('body').on('keydown',function(e)
	{
		//console.log(e.keyCode);
		if (e.keyCode==16) // shift
		{
			shiftPressed=true;
		} 
		else
		if (e.keyCode==17) // ctrl
		{
			ctrlPressed=true;
		} 
		/*
		apparently, alt works differently ("stays down", sort of)
		else
		if (e.keyCode==18) // alt
		{
			altPressed=true;
		}
		*/
		else
		if (e.altKey && e.keyCode==38) // alt+up
		{
			switchServerIndex(true);
		} 
		else
		if (e.altKey && e.keyCode==40) // alt+down
		{
			switchServerIndex(false);
		}		
		else
		if (e.ctrlKey && e.keyCode==83) // ctrl+s
		{
			saveQueryViaKeyboard(e);
		}	
	});

	$('body').on('keyup',function(e)
	{
		//console.log(e.keyCode);
		if (e.keyCode==16) // shift
		{
			shiftPressed=false;
		} 

		if (e.keyCode==17) // ctrl
		{
			ctrlPressed=false;
		}

		if (e.keyCode==113) // F2
		{
			e.preventDefault();
			helpToggle();
		}
		else
		if (e.keyCode==115) // F4
		{
			e.preventDefault();
			linksToggle();
		}
		else
		if (e.keyCode==27) // esc
		{
			e.preventDefault();
			$('#helpDiv').toggle(false);
			$('#linksDiv').toggle(false);
		}

		if (e.altKey && e.keyCode==46) // alt+delete
		{
			clearResults();
		}
		else
		if (e.ctrlKey && e.keyCode==13) // ctrl+enter
		{
			$('#query-trigger').trigger('click');
		}
		else
		if (e.ctrlKey && e.keyCode==118) // ctrl+F7
		{
			clearQuery();
		}
		else
		if (e.ctrlKey && e.keyCode==119) // ctrl+F8
		{
			$('#query').focus();
		}
		else
		if (e.ctrlKey && e.keyCode==120) // ctrl+F9
		{
			$('#documentFieldsSearch').focus();
		}		
	});

}

function storageCleanUp()
{
	$.jStorage.deleteKey("");
}	

function queryWindowContextToggle()
{
	if (queryWindowContextmenuActive)
	{
		$('#query').off('contextmenu');
		queryWindowContextmenuActive=false;
		setMessage('query window context menu off');
	}
	else
	{
		bootstrapQueryWindowContextmenu();
	}
}

function populatePurlAcceptHeaders()
{
	$.each(purlAcceptHeaders, function(index, value)
	{
		$('#purlAcceptHeaders').append($('<option>', {value: value, text: value}));
	});
}

function togglePurlAcceptHeaders()
{
	$('.purl-input').prop('disabled',!server.allowCrossDomain)
}