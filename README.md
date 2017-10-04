# nba_scratchpad

Python/Flask application that serves up NBA Scratchpad, a html/Javascript/CSS-based tool for use with the Netherlands Biodiversity API.

Environment variables:
LISTENING_PORT: listening port of the Flask app (default: 80)
NBA_ADDRESS: IP or domain of the NBA Server, as seen from the server (required)
NBA_PORT: port at the NBA Server listens (required)
NBA_TIMEOUT: timeout for communication with the NBA (seconds, default: 10)
PUBLIC_NBA_ADDRESS: IP or domain of the NBA Server, as seen from the client (for some direct links; defaults to NBA_ADDRESS)