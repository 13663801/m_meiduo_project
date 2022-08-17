from django.shortcuts import render
from django.views import View

# Create your views here.

class RegisterView(View):
    """用户注册"""
    def get(selfself,request):
        """提供注册页面"""
        return render(request, 'register.html')



