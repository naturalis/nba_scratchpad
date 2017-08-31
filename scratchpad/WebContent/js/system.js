/*
	[servers]
	array of NBAv2 servers. contains one or more server objects. each server object has the following properties:

	label     			visible label in the server selection dropdown; can be anything.
	url       			domain of the server, including 'http://' and port, but without the closing  '/'
	testpath  			optional link to the page that displays server status
	default   			server that is selected by default when page opens for the first time (true or false; optional)
	disable	  			toggle to temporarily disable a server
	allowCrossDomain	JS can access server directly (true|false; requires CORS-header settings on the server)
	noServices			server has no services (true|false; suppresses checking, increases load speed)

	example:
	{ label: "v2 test server", url: "http://145.136.242.166:8080", testpath: "http://145.136.242.166:8080/v2/", default: true }

*/
var servers=[
	{ label: "v2 test (145.136.242.167:8080)", url: "http://145.136.242.167:8080", testpath: "http://145.136.242.167:8080/v2/", allowCrossDomain: true },
	{ label: "v2 dev (145.136.242.164)", url: "http://145.136.242.164:8080", testpath: "http://145.136.242.164:8080/v2/" }
];

var nbaServerConfig={
	version: 'v2',
	metaServiceUrls : {
		restServices: '/metadata/getRestServices',
		getPaths: '/metadata/getPaths',
		getFieldInfo: '/metadata/getFieldInfo'
	}
}

var nonDocumentPathRoots=[ "metadata", "ping", "release-notes" ];

var queryOperators=["=","EQUALS","EQUALS_IC", "STARTS_WITH","GT","GTE","IN","LIKE","LT","LTE","BETWEEN","MATCHES","!=","NOT_EQUALS","NOT_EQUALS_IC","NOT_IN","NOT_LIKE","NOT_BETWEEN","NOT_MATCHES"];

var codeBits=[
	{ label: "conditions", code: '  "conditions" : [ ],' },
	{ label: "condition", code: '    { "field" : "FIELD", "operator" : "OPERATOR", "value" : "VALUE",  "constantScore": STATE, "boost" : BOOST },' },
	{ label: "NULL-condition", code: '    { "field" : "FIELD", "operator" : "EQUALS|NOT_EQUALS" },' },
	{ label: "logicalOperator", code: '  "logicalOperator" : "AND|OR",' },
	{ label: "fields", code: '  "fields" : [ "FIELD", "FIELD" ],' },
	{ label: "sortFields", code: '  "sortFields" : [ { "path" : "FIELD", "sortOrder" : "ASC|DESC" } ],' },
	{ label: "from & size", code: '  "from" : 0, "size" : 100 ' },
	{ label: "from", code: '  "from" : 0,' },
	{ label: "size", code: '  "size" : 100,' },
	{ label: "constantScore", code: '  "constantScore" : true|false,' },
	{ label: "groupBySpecimen only" },
	{ label: "groupSort", code: '  "groupSort" : "COUNT_DESC|COUNT_ASC|NAME_ASC|NAME_DESC|TOP_HIT_SCORE",' },
	{ label: "groupFilter (array)", code: '  "groupFilter" : { "acceptValues|rejectValues" : [ "FIELD", "FIELD", "FIELD" ] },' },
	{ label: "groupFilter (regExp)", code: '  "groupFilter" : { "acceptRegexp|rejectRegexp" : ".*\\?.*" },' },
	{ label: "specimensFrom & specimensSize", code: '  "specimensFrom" : 0, "specimensSize" : 100 ' },
	{ label: "specimensFrom", code: '  "specimensFrom" : 0,' },
	{ label: "specimensSize", code: '  "specimensSize" : 100,' },
	{ label: "noTaxa", code: '  "noTaxa" : true|false,' },
	{ label: "complete queries" },
	{ label: "full query", code: '{'+"\n"+'  "conditions" : ['+"\n"+'    { "field" : "FIELD", "operator" : "OPERATOR", "value" : "VALUE",  "constantScore": true|false, "boost" : BOOST, "not": "not",'+"\n"+'      "or" : ['+"\n"+ '        { "field" : "FIELD", "operator" : "OPERATOR", "value" : "VALUE" }'+"\n"+ '       ]'+"\n"+ '    }'+"\n"+ '  ],'+"\n"+'  "logicalOperator" : "AND",'+"\n"+'  "fields" : [ "FIELD", "FIELD", "FIELD" ],'+"\n"+'  "sortFields" : [ { "path" : "FIELD", "sortOrder" : "ASC|DESC" } ],'+"\n"+'  "from" : 0,'+"\n"+'  "size" : 100,'+"\n"+'  "constantScore" : true|false,'+"\n"+'  "noTaxa" : true,'+"\n"+'  "specimensFrom" : 0,'+"\n"+'  "specimensSize" : 100'+"\n"+'}'},
	{ label: "query", code: '{'+"\n"+'  "conditions" : ['+"\n"+'    { "field" : "FIELD", "operator" : "OPERATOR", "value" : "VALUE" }'+"\n"+'  ],'+"\n"+'  "logicalOperator" : "AND",'+"\n"+'  "from" : 0,'+"\n"+'  "size" : 100'+"\n"+'}'},
	{ label: "groupBySpecimen-query", code: '{'+"\n"+'  "conditions" : ['+"\n"+'    { "field" : "FIELD", "operator" : "OPERATOR", "value" : "VALUE" }'+"\n"+ '  ],'+"\n"+'  "logicalOperator" : "AND",'+"\n"+'  "fields" : [ "FIELD", "FIELD", "FIELD" ],'+"\n"+'  "groupSort" : "COUNT_DESC|COUNT_ASC|NAME_ASC|NAME_DESC",'+"\n"+'  "noTaxa" : true,'+"\n"+'  "specimensFrom" : 0,'+"\n"+'  "specimensSize" : 100'+"\n"+'  "groupFilter" : [ "FIELD", "FIELD", "FIELD" ],'+"\n"+'  "groupFilter" : { "rejectRegexp" : ".*\\?.*" },'+"\n"+'  "from" : 0,'+"\n"+'  "size" : 100,'+"\n"+'}'},
	{ label: "query (HR)", code: 'FIELD=VALUE&FIELD=VALUE&_from=0&_size=100&_logicalOperator=AND|OR&_fields=FIELD,FIELD,FIELD&_ignoreCase=true|false' }	
];

var proxyServer="http://query.yahooapis.com/v1/public/yql";

var googleUrl = 'https://www.google.nl/search?q=%SEARCH%';

/*
	items without URL are displayed as section headers.
*/
var usefulLinks=[
	{label: "Kibana" },
	{label: "Kibana (v2 test)", url: "http://145.136.242.167:5601/app/kibana/" },
	{label: "Kibana (v2 dev)", url: "http://145.136.242.164:5601/app/kibana/" },
	{label: "doc" },
	{label: "NBA (Java Client) doc (v2)", url: "http://naturalis.github.io/naturalis_data_api/javadoc/v2/client/" },
	{label: "API doc (v0.15)", url: "http://docs.biodiversitydata.nl/en/latest/" },
	{label: "Elasticsearch Query DSL", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html" },
	{label: "other" },
	{label: "BioPortal (v0.15)", url: "http://bioportal.naturalis.nl/" },
	{label: "JSON parser", url: "http://jsonviewer.stack.hu/" },
];

/*
	number of inserted spaces when doing ctrl+space in query window
*/
var ctrlSpaceNumberOfSpaces=2;

var purlAcceptHeaders = [ "text/html", "application/json", "application/xml", "image/jpeg", "image/png", "audio/mp3", "application/pdf", "video/mp4" ];
