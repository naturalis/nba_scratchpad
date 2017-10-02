function checkExportQueryToggle( number )
{
	$('#export-'+number+'-on').css('display',$('#export-'+number).is(':checked') ? 'inline-block' : 'none');
	$('#export-'+number+'-off').css('display',$('#export-'+number).is(':checked') ? 'none' : 'inline-block');
}

function checkExportGroupToggle( groupid )
{
	$('#group-export-'+groupid+'-on').css('display',$('#group-export-'+groupid).is(':checked') ? 'inline-block' : 'none');
	$('#group-export-'+groupid+'-off').css('display',$('#group-export-'+groupid).is(':checked') ? 'none' : 'inline-block');
	
	$('#group-'+groupid+' li').each(function()
	{
		$(this).find('.query-export').first().prop('checked',$('#group-export-'+groupid).is(':checked')).trigger('change');
	});
}

function exportQueryToggleAll( state )
{
	$('.query-export').each(function()
	{
		$(this).prop('checked',state); 
		$(this).trigger('change');
	});

	$('.query-group-select').each(function()
	{
		$(this).prop('checked',state); 
		$(this).trigger('change');
	});
}

function exportQueryCount()
{
	var n=0;
	$('.query-export').each(function()
	{
		if ($(this).prop('checked')==true)
		{
			n++;
		}
	});
	$( '.export-query-count' ).html(n);
}

function makeUniqueKey( key )
{
	var keys=$.jStorage.index();
	var nkey=key;
	var n=0;
	while (keys.indexOf(nkey)!=-1) {
		nkey=key+" ("+(n++)+")";
	}
	return nkey;
}

function hideExportOptionsWindow()
{
	if ($('#exportOptions').is(':visible'))
	{
		$('.export').toggle();
	}
}

function queryExport()
{
	var selected=[];
	$('.query-export').each(function()
	{
		if ($(this).prop('checked')==true)
		{
			var t = queryIndex[parseInt($(this).attr('id').replace('export-',''))];
			selected.push(t);
			selected.push(t.replace(/^query:/,"notes:"));
		}
	});
	
	if (selected.length==0) return;

	var exp=[];
	var allItems=$.jStorage.index();
	
	for(var i=0;i<allItems.length;i++)
	{
		if (selected.indexOf(allItems[i])!=-1)
		{
			exp.push({key:allItems[i],value:getStoredItem(allItems[i])});
		}
	}

	$('#query').val(JSON.stringify(exp));
}

function queryImport()
{
	var raw=$('#query').val().trim();
	
	if (raw.length==0) return;
	
	if (confirm("are you sure you want to import?"))
	{
		try {
			var imp=JSON.parse(raw);
			var saved=0;
			for (var i=0;i<imp.length;i++)
			{
				var q=imp[i];
				if (q.key && q.value)
				{
					$.jStorage.set(makeUniqueKey(q.key),q.value);
					saved++;
				}
			}
			setMessage( "imported "+saved+" queries" );
			$('#query').val("");
			$('.export').toggle();
			getQueryIndex();
			drawQueryIndex();
		} 
		catch(ex)
		{
			setMessage( "error occurred: " + ex, 10000 );
		}
	}
}

function queryDeleteSelected()
{
	if (confirm("are you sure you want to delete?"))
	{
		var selected=[];
		$('.query-export').each(function()
		{
			if ($(this).prop('checked')==true)
			{
				var t = queryIndex[parseInt($(this).attr('id').replace('export-',''))];
				selected.push(t);
				selected.push(t.replace(/^query:/,"notes:"));
			}
		});
		
		if (selected.length==0) return;

		var allItems=$.jStorage.index();
		
		for(var i=0;i<allItems.length;i++)
		{
			if (selected.indexOf(allItems[i])!=-1)
			{
				$.jStorage.deleteKey(allItems[i]);
			}
		}

		setMessage("queries deleted");
		$('.export').toggle();
		getQueryIndex();
		checkExampleQueries();
		drawQueryIndex();
	}
}

