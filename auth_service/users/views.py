import json
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# We exempt CSRF here because our React frontend is handling the security token
@method_decorator(csrf_exempt, name='dispatch')
class CustomAuthToken(View):
    
    # This explicitly tells Django: "It is safe to accept POST requests here!"
    def post(self, request):
        try:
            # 1. Open the JSON envelope from the Gateway
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            # 2. Check the MySQL database to see if the user exists
            user = authenticate(username=username, password=password)
            
            # 3. If the password matches, send the unlock token back!
            if user is not None:
                return JsonResponse({'token': 'secure-token-123', 'username': user.username}, status=200)
            else:
                return JsonResponse({'error': 'Invalid Credentials'}, status=400)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)