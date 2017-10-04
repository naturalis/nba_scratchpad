# nba_scratchpad

Python/Flask application that serves up NBA Scratchpad, a html/Javascript/CSS-based tool for use with the Netherlands Biodiversity API.__
__
Environment variables:__
LISTENING_PORT: listening port of the Flask app (default: 80)__
NBA_ADDRESS: IP or domain of the NBA Server, as seen from the server (required)__
NBA_PORT: port at the NBA Server listens (required)__
NBA_TIMEOUT: timeout for communication with the NBA (seconds, default: 10)__
PUBLIC_NBA_ADDRESS: IP or domain of the NBA Server, as seen from the client (for some direct links; defaults to NBA_ADDRESS)__