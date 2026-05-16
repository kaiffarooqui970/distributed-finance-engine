import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows our React frontend on port 3000 to talk to this gateway safely

# Clean internal URLs using the correct Docker network names
AUTH_SERVICE_URL = "http://auth-service:8000"
FINANCE_SERVICE_URL = "http://finance_backend:8080" # Using the clean container name!

@app.route('/')
def home():
    return jsonify({"message": "Gateway Server is Active"})

# 1. Forward Login Requests to Django Auth Service
@app.route('/login', methods=['POST'])
def proxy_login():
    try:
        resp = requests.post(f"{AUTH_SERVICE_URL}/login/", json=request.get_json())
        return (resp.text, resp.status_code, resp.headers.items())
    except Exception as e:
        return jsonify({"error": f"Gateway failed to reach Auth Service: {str(e)}"}), 500

# 2. Forward Calculation Requests to C++ Finance Service
@app.route('/calculate', methods=['POST'])
def proxy_finance():
    try:
        resp = requests.post(f"{FINANCE_SERVICE_URL}/calculate-retirement", json=request.get_json())
        return (resp.text, resp.status_code, resp.headers.items())
    except Exception as e:
        return jsonify({"error": f"Gateway failed to reach Finance Service: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)