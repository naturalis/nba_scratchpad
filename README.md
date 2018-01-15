# nba_scratchpad

Python/Flask application that serves up NBA Scratchpad, a html/Javascript/CSS-based tool for use with the Netherlands Biodiversity API.  
  
Environment variables:  
+ LISTENING_PORT: listening port of the Flask app (default: 80)  
+ LISTENER_BASE_PATH: base path of the application (default: /scratchpad/)
+ NBA_ADDRESS: IP or domain of the NBA Server, as seen from the server (required)  
+ NBA_PORT: port at the NBA Server listens (required)  
+ NBA_TIMEOUT: timeout for communication with the NBA (seconds, default: 10)  
+ PUBLIC_NBA_FULL_ADDRESS: IP or domain + port of the NBA Server, as seen from the client (for direct links; defaults to NBA_ADDRESS)  

Usage:
+ access NBA Scratchpad: http://&lt;SERVER ADDRESS&gt;:80/scratchpad/
+ F2 opens help file
+ start Scratchpad with an external query (useful for linking example from documentation):  http://&lt;SERVER ADDRESS&gt;:80/scratchpad/?_querySpec=&lt;query&gt;
