var devToolsConsolePath = "/app/kibana#/dev_tools/console";
var devToolsConsolePort = "5601";
var mappingWindowName="_blank";
var fields=[];
var memory=[];
var analyzers=[];
var datatypes=[];
var v015label="";
var elasticQueryDSL=[
	{
		label: 'mapping',
		queries: [ 
			{ query: 'GET multimedia/_mapping' },
			{ query: 'GET specimens/_mapping' },
			{ query: 'GET taxa/_mapping' },
			{ query: 'GET geoareas/_mapping' },
			{ query: 'GET names/_mapping' }
		]
	}
];


var ndsDocuments = [
	{ index: 'taxa', document: 'Taxon' },
	{ index: 'multimedia', document: 'MultiMediaObject' },
	{ index: 'specimens', document: 'Specimen' },
	{ index: 'geoareas', document: 'GeoArea' },
	{ index: 'names', document: 'ScientificNameGroup' },
];


function rememberAnalyzer( f )
{
	for (var i=0;i<analyzers.length;i++)
	{
		if (analyzers[i].analyzer==f)
		{
			analyzers[i].count++;
			return;
		}
	}

	analyzers.push({analyzer:f,count:1});
}

function rememberDatatype( f )
{
	for (var i=0;i<datatypes.length;i++)
	{
		if (datatypes[i].datatype==f)
		{
			datatypes[i].count++;
			return;
		}
	}

	datatypes.push({datatype:f,count:1});
}

function writeAnalyzerLinks()
{
	var buffer=[];
	for(var i=0;i<analyzers.length;i++)
	{
		buffer.push(fetchTemplate( "analyzerSwitchTpl" ).trim().replace('%ANALYZER%',analyzers[i].analyzer).replace('%COUNT%',analyzers[i].count));
	}
	$( "#analyzers" ).html("analyzers: " + buffer.join(fetchTemplate( "switchDividerTpl" ))).toggle(true);
	$( ".analyzerSwitch" ).on('click',function()
	{
		$('.field').toggle(false);
		$('.'+$(this).html().trim()).toggle(true);
	});
}

function writeDatatypeLinks()
{
	var buffer=[];
	for(var i=0;i<datatypes.length;i++)
	{
		buffer.push(fetchTemplate( "datatypeSwitchTpl" ).trim().replace('%DATATYPE%',datatypes[i].datatype).replace('%COUNT%',datatypes[i].count));
	}
	$( "#datatypes" ).html("datatypes: " + buffer.join(fetchTemplate( "switchDividerTpl" ))).toggle(true);
	$( ".datatypeSwitch" ).on('click',function()
	{
		$('.field').toggle(false);
		$('.'+$(this).html().trim()).toggle(true);
	});
}

function traverse(obj,level)
{
	for (var key in obj)
	{
		var d={name:key,level:level,type:(obj[key].type=obj[key].type ? obj[key].type : "nested"),analyzers:[]};
		rememberDatatype( d.type );

		if (obj[key].fields)
		{
			for (var field in obj[key].fields)
			{
				var a;
				// ESv1
				if(obj[key].fields[field].index && obj[key].fields[field].index=="not_analyzed")
				{
					a="standard";
				} 
				else
				if(obj[key].fields[field].index_analyzer)
				{
					a=obj[key].fields[field].index_analyzer;
				} 
				// ESv2/5
				else
				if ( obj[key].fields[field].analyzer)
				{
					a=obj[key].fields[field].analyzer;
				}
				else
				{
					a="standard";
				}

				d.analyzers.push({
					name:field,
					type:obj[key].fields[field].type,
					analyzer:a
				});
				
				rememberAnalyzer(a);
			}
		}
		fields.push(d);
		if (obj[key].properties)
		{
			traverse(obj[key].properties,level+1);
		}
	}
}

function parseMapping()
{
	try {
		var parsed = $.parseJSON($("#mapping").val());
	} catch(ex) {
		return;
	}
	var rootObject = parsed;
	$( '#mapping-name' ).html( v015label );
	for(var i=0;i<ndsDocuments.length;i++)
	{
		if (ndsDocuments[i].index==Object.keys(parsed)[0])
		{
			$( '#mapping-name' ).html( ndsDocuments[i].index + "." + ndsDocuments[i].document );
			var rootObject = eval('parsed.'+ndsDocuments[i].index+'.mappings.'+ndsDocuments[i].document);
		}
	}
	traverse(rootObject.properties,0);
	writeAnalyzerLinks();
	writeDatatypeLinks();
}

function rememberPath(level,path)
{
	for(var i=0;i<memory.length;i++)
	{
		if (memory[i].level==level)
		{

			memory[i].path=path;
			return;
		}
	}
	memory.push({level:level,path:path});
}

function getMemory(level)
{
	for(var i=0;i<memory.length;i++)
	{
		if (memory[i].level==level)
		{
			return memory[i].path;
		}
	}
}

function printMapping()
{
	var indent=fetchTemplate( "indentTpl" ).trim();
	var buffer=[];
	for(var i=0;i<fields.length;i++)
	{
		var f=fields[i];
		rememberPath(f.level,f.name);
		var path="";
		for(var x=f.level-1;x>=0;x--)
		{
			path = getMemory(x)+"."+path;
		}

		var a="";
		var b="";
		
		var analyzerTpl = ctrlPressed ? fetchTemplate( "JIRAanalyzerTpl" ) : fetchTemplate( "analyzerTpl" );
		var mappingFieldTpl = ctrlPressed ? fetchTemplate( "JIRAmappingFieldTpl" ) : fetchTemplate( "mappingFieldTpl" );
		
		for (var j=0;j<f.analyzers.length;j++)
		{
			a += (j>0 ? "; " : "" ) + analyzerTpl.trim().replace(/%ANALYZER%/g,f.analyzers[j].analyzer).replace('%TYPE%',f.analyzers[j].type);
			b += " " + f.analyzers[j].analyzer;
		}
		buffer.push(
			mappingFieldTpl
				.trim()
				.replace('%PATH%',path)
				.replace('%BUFFER%',indent.repeat(f.level))
				.replace('%NAME%',f.name)
				.replace(/%TYPE%/g,f.type)
				.replace('%ANALYZERS%',a ? "["+a+"]" : "")
				.replace('%HAS_ANALYZERS%',a ? "has_analyzers" + b : "no_analyzers")
		)
	}
	
	$('.buffer_switch').toggle(true);
	$('.analyzer_switch').toggle(true);
	$('#output').html( fetchTemplate( "mappingTableTpl" ) .replace('%ROWS%',buffer.join("\n")));
	if (ctrlPressed)
	{
		$('#output').html( 
			"_" + $( '#servers :selected' ).text() + "_" + "<br />"+
			"_" + $( '#mapping-name' ).html() + "_" + "<br /><br />"+
			$( '#output' ).html()
		);
	}
}

function clearOutput()
{
	fields.splice(0,fields.length);
	memory.splice(0,memory.length);
	analyzers.splice(0,analyzers.length);
	datatypes.splice(0,datatypes.length);
	$('#output').html("");
}

function loadv015DocumentModel(type)
{
	v015label="nda."+type;
	$("#mapping").val(fetchTemplate( "v015"+type+"Tpl" ).trim());
}

function launchKibana()
{
	var u=document.createElement('a');
	u.href = server.url;
	window.open( u.protocol + '//' + u.hostname + ':' + devToolsConsolePort + devToolsConsolePath , ' _kibana' );
}

function getQuerySet( label )
{
	for(var i =0;i<elasticQueryDSL.length;i++)
	{
		if (elasticQueryDSL[i].label==label)
		{
			return elasticQueryDSL[i];
		}
	}
}

function printMappingQueries()
{
	var set=getQuerySet('mapping');
	var buffer=[];

	for(var i=0;i<set.queries.length;i++)
	{
		var q=set.queries[i];
		buffer.push(
			fetchTemplate( "mappingQueryLineTpl" )
				.replace( '%LABEL%', q.label ? q.label : q.query )
				.replace( /%QUERY%/g , q.query )
		);
	}
	
	$('#mapping-queries').html(buffer.join("\n"));
}

