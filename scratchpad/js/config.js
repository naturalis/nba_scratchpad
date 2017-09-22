/*
	[extra servers]
	each server object has the following properties:
	url       			domain or IP of the server, including 'http://' and port
	label     			visible label in the server selection dropdown; can be anything (optional; when absent, URL will be used as display label).
	testpath  			optional link to the page that displays server status (optional; will default to url+'/v2/' when empty)
	default   			server that is selected by default when page opens for the first time (true|false*; optional)
	disable	  			toggle to temporarily disable a server (i.e., hide from  server list; true|false*)
	allowCrossDomain	JS can access server directly (true|false*; requires CORS-header settings on the server)
	noServices			server has no services (true*|false; suppresses checking, increases load speed)

	example:
	servers.push( { label: "v2 PL (V2.8_dev)", url: "http://145.136.240.125:30076", allowCrossDomain: true } );

*/
servers.unshift( { label: "v2 dashboard (145.136.242.166)", url: "http://145.136.242.166:8080/", testpath: "http://145.136.242.166:8080/v2/" } );
servers.push( { label: "v2 localhost", url: "http://localhost", testpath: "http://localhost:8080/v2/" } );
servers.push( { label: "v2 import test (145.136.243.12:30856)", url: "http://145.136.243.12:30856", testpath: "http://145.136.243.12:30856/v2/" } );
servers.push( { label: "v2 PL (V2.9_dev)", url: "http://145.136.240.125:30076", allowCrossDomain: true, default: true } );
servers.push( { label: "v2 PL (V2.7_dev)", url: "http://145.136.240.125:31932", allowCrossDomain: true } );
servers.push( { label: "v2 PL (V2.9_dev via Tunnel)", url: "http://localhost:23232", allowCrossDomain: true } );
servers.push( { label: "v2 test V2.7_dev", url: "http://145.136.242.167:8081", allowCrossDomain: true } );
servers.push( { label: "v2 Dev", url: "http://145.136.242.164:8080" } );
servers.push( { label: "v0 (http://api.biodiversitydata.nl/)", url: "http://api.biodiversitydata.nl", testpath: "http://api.biodiversitydata.nl/v0/", noServices: true } );

/*
	you can add extra static services. use the "port" property to define a different port for the selected server.
*/
var staticServices = [
	{ document: "static services", label: "all services", path: "/v2/metadata/getRestServices", noQuery: true },
	{ document: "static services", label: "PURL", path: "/purl/naturalis/specimen/", encodeQuery: true, port: 8090 },
	{ document: "NBAv0", label: "specimen (free)", path: "/v0/specimen/search/?_search=" },
	{ document: "NBAv0", label: "specimen-name (free)", path: "/v0/specimen/name-search/?_search=" },
	{ document: "NBAv0", label: "taxon (free)", path: "/v0/taxon/search/?_search=" },
	{ document: "NBAv0", label: "multimedia (free)", path: "/v0/multimedia/search/?_search=" },
	{ document: "NBAv0", label: "specimen (indexed)", path: "/v0/specimen/search/?" },
	{ document: "NBAv0", label: "specimen-name (indexed)", path: "/v0/specimen/name-search/?" },
	{ document: "NBAv0", label: "taxon (indexed)", path: "/v0/taxon/search/?" },
	{ document: "NBAv0", label: "multimedia (indexed)", path: "/v0/multimedia/search/?" },
]


/*
	set to true suppress the automatic creation of two example queries when no queries are present.
*/	
noExampleQueries=true;
	
/*
	set to false to keep typed search term in the 'type as you find' input for searching fields
*/	
clearFieldFindInputAfterSelect=true;
	
/*
	if you can't get your JSON-plugin to work in the result frame, you can tell the application to always open the results in a separate browser window
	by setting the alwaysRunQueryInOwnWindow to true. the application will always (also) open the results in a separate browser, and will re-use the same window,
	so you can move the tab to a new window, and position it so it remains visible in your workspace while you create your queries.
*/
alwaysRunQueryInOwnWindow=false;

/*
	set doNotVerifyQueryJson to true to suppress the verifying of the JSON of your queries (allow the execution of faulty queries)
*/
doNotVerifyQueryJson=true;

/*
	set replaceEmptyQueryWithBrackets to false to suppress the adding of {} to an empty query (service with encodeQuery=true only)
*/	
replaceEmptyQueryWithBrackets=true;

/*
	include fields in suggestion list that are not indexed
*/
includeNonSearchableDocumentFields=false


/*
	number of inserted spaces when doing ctrl+space in query window
*/
ctrlSpaceNumberOfSpaces=2;


codeBits.push( { label: "NBAv0" } );
codeBits.push( { label: "NOT_NULL example", code: 'typeStatus=NOT_NULL'} );

usefulLinks=
	[
		{label: "v2 test dashboard" },
		{label: "Kibana (v2 test dashboard)", url: "http://145.136.242.166:5601/app/kibana/" },
		{label: "Minio (requires ssh-tunnel)", url: "http://localhost:55503/" },
		{label: "Grafana (requires ssh-tunnel)", url: "http://localhost:55504/" },
		{label: "v2 other" },
		{label: "Kibana (v2 test)", url: "http://145.136.242.167:5601/app/kibana/" },
		{label: "Kibana (v2 dev)", url: "http://145.136.242.164:5601/app/kibana/" },
		{label: "bioportal v2" },
		{label: "dev", url: "http://145.136.242.15/" },
		{label: "test (?)", url: "http://145.136.242.149/" },
		{label: "doc" },
		{label: "API doc (v0.15)", url: "http://docs.biodiversitydata.nl/en/latest/" },
		{label: "NBA (Java Client) doc (v2)", url: "http://naturalis.github.io/naturalis_data_api/javadoc/v2/client/" },
		{label: "Elasticsearch Query DSL", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html" },
		{label: "Elasticsearch regExp syntax", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html#regexp-syntax" },
		{label: "v0.15" },
		{label: "BioPortal (v0.15)", url: "http://bioportal.naturalis.nl/" },
		{label: "BioPortal (v0.15; NDFF test)", url: "http://145.136.242.60/" },
		{label: "Sense (v0.15)", url: "http://145.136.242.163:5601/app/sense" },
		{label: "NBAv0 specimen", url: "http://api.biodiversitydata.nl/v0/specimen/search/?" },
		{label: "NBAv0 specimen-name", url: "http://api.biodiversitydata.nl/v0/specimen/name-search/?" },
		{label: "other" },
		{label: "JSON parser", url: "http://jsonviewer.stack.hu/" },	
		{label: "JSON to CSV", url: "https://json-csv.com/" },	
		{label: "geojson.io", url: "http://geojson.io/" },
		{label: "MultiPolygon jsfiddle", url: "http://jsfiddle.net/erictheise/VaGy5/" },
	];

