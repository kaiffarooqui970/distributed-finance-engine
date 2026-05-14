from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the new tool
import requests

app = Flask(__name__)
CORS(app)

# The internal URLs of your other containers
AUTH_SERVICE_URL = "http://auth_service:8000"
FINANCE_SERVICE_URL = "http://finance_service:8080"

@app.route('/')
def home():
    return jsonify({"message": "Gateway Server is Active"})

# This route forwards login requests to the Auth Service
@app.route('/login', methods=['POST'])
def proxy_auth():
    resp = requests.post(f"{AUTH_SERVICE_URL}/login/", json=request.get_json())
    return (resp.text, resp.status_code, resp.headers.items())

# This route forwards calculation requests to the C++ Finance Service
@app.route('/calculate', methods=['POST']) 
def proxy_finance():
    resp = requests.post(f"{FINANCE_SERVICE_URL}/calculate-retirement", json=request.get_json())
    return (resp.text, resp.status_code, resp.headers.items())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)