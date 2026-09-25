import jwt
import time
import requests
import json

def get_admin_token():
    payload = {
        'sub': '00000000-0000-0000-0000-000000000000',
        'role': 'ADMIN',
        'iss': 'sih26043',
        'iat': int(time.time()),
        'exp': int(time.time()) + 3600
    }
    secret = 'local-dev-only-secret-key-min-32-bytes-change-me!!'
    return jwt.encode(payload, secret, algorithm='HS256')

def main():
    token = get_admin_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Wait for service to be up
    base_url = 'http://localhost:8080'
    print("Waiting for API gateway and capability service to be up...")
    max_retries = 30
    for i in range(max_retries):
        try:
            r = requests.get(f"{base_url}/capability/registry", headers=headers, timeout=2)
            if r.status_code == 200:
                print("Service is up!")
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
        if i == max_retries - 1:
            print("Failed to reach capability service")
            return

    # Import data
    import_payload = {
        "versionName": "Test Registry V1",
        "source": "AISHE",
        "institutions": [
            {
                "aisheIdentifier": "U-0001",
                "name": "Test Institute of Technology",
                "state": "Maharashtra",
                "district": "Pune",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "departments": ["Computer Science"],
                "labs": ["AI Lab"],
                "equipment": ["NVIDIA A100"],
                "skills": ["AI", "Machine Learning", "Python", "Java"],
                "rawJsonData": "{}"
            }
        ]
    }
    
    print("Testing /capability/registry/import...")
    r = requests.post(f"{base_url}/capability/registry/import", headers=headers, json=import_payload)
    print(f"Import Status: {r.status_code}")
    print(f"Import Response: {r.text}")
    
    if r.status_code == 200:
        version_id = r.json().get('newRegistryVersionId')
        
        print(f"Testing /capability/registry/publish?versionId={version_id}...")
        r2 = requests.post(f"{base_url}/capability/registry/publish?versionId={version_id}", headers=headers)
        print(f"Publish Status: {r2.status_code}")
        print(f"Publish Response: {r2.text}")

if __name__ == '__main__':
    main()
