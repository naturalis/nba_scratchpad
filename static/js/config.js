/*
	you can add extra static services. use the "port" property to define a different port for the selected server.
*/
var staticServices = [
	{ document: "static services", label: "all services", path: "/v2/metadata/getRestServices", noQuery: true }
]

/*
	set to true suppress the automatic creation of two example queries when no queries are present.
*/	
noExampleQueries=false;
	
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
doNotVerifyQueryJson=false;

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
