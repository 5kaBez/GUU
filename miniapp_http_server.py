#!/usr/bin/env python3
"""
Simple HTTP server for MiniApp - runs on port 5001
This allows easy access without SSL certificate issues
Also proxies API requests to the main Flask server
"""

from flask import Flask, send_from_directory, request, jsonify
from pathlib import Path
import logging
import requests
import ssl

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# SSL verification disabled for localhost self-signed certs
requests.packages.urllib3.disable_warnings()
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

MINIAPP_DIST = Path(__file__).parent / 'miniapp' / 'dist'
API_BASE_URL = 'https://localhost:5000'


# API Proxy - forward requests to main Flask server
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(path):
    """Proxy API requests to main Flask server"""
    try:
        url = f'{API_BASE_URL}/api/{path}'
        
        # Forward query parameters
        if request.query_string:
            url += f'?{request.query_string.decode()}'
        
        # Forward the request
        response = requests.request(
            method=request.method,
            url=url,
            headers={key: value for key, value in request.headers if key != 'Host'},
            data=request.get_data(),
            verify=False
        )
        
        logger.info(f"Proxied {request.method} /api/{path} -> {response.status_code}")
        
        # Return response with same status and content
        return response.get_json() if response.headers.get('content-type') == 'application/json' else response.text, response.status_code
        
    except Exception as e:
        logger.error(f"Proxy error for /api/{path}: {e}")
        return {'error': str(e)}, 502


@app.route('/')
@app.route('/miniapp')
@app.route('/miniapp/')
def serve_miniapp():
    """Serve MiniApp index.html"""
    if not MINIAPP_DIST.exists():
        return {'error': 'MiniApp not built yet'}, 404
    return send_from_directory(MINIAPP_DIST, 'index.html')


@app.route('/miniapp/<path:path>')
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (JS, CSS, etc)"""
    if not MINIAPP_DIST.exists():
        return {'error': 'MiniApp not built'}, 404
    try:
        return send_from_directory(MINIAPP_DIST, path)
    except:
        return send_from_directory(MINIAPP_DIST, 'index.html')


@app.before_request
def log_request():
    logger.info(f"Request: {request.method} {request.path}")


@app.after_request
def add_cors_headers(response):
    """Add CORS headers to all responses"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("MiniApp HTTP Server (Debug Mode)")
    logger.info("=" * 50)
    logger.info(f"MiniApp available at: http://localhost:5001/miniapp")
    logger.info("=" * 50)
    app.run(debug=False, port=5001, host='0.0.0.0')
