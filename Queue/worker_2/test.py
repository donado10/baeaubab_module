import jwt
import datetime

# Your generated secret from Step 1
JWT_SECRET = 'YOUR_GENERATED_SECRET_FROM_STEP_1'

# Set an expiration date far in the future
# PyJWT uses 'exp' inside the payload for expiration
expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3650)

# Generate Anon Key
anon_payload = {'role': 'anon', 'exp': expiry}
anon_key = jwt.encode(anon_payload, JWT_SECRET, algorithm='HS256')
print(f'ANON_KEY: {anon_key}')

# Generate Service Role Key
service_payload = {'role': 'service_role', 'exp': expiry}
service_key = jwt.encode(service_payload, JWT_SECRET, algorithm='HS256')
print(f'SERVICE_ROLE_KEY: {service_key}')