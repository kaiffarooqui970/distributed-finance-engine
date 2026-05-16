from django.contrib import admin
from django.urls import path
from users.views import CustomAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', CustomAuthToken.as_view()),
]