from django import http
from django.contrib.auth import login
from django.db import DatabaseError
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View
import re
from users.models import User
from utils.response_code import RETCODE
from django_redis import get_redis_connection
# Create your views here.



class RegisterView(View):
    """用户注册"""
    def get(self,request):
        """提供注册页面"""
        return render(request, 'register.html')

    def post(self, request):
        """
        实现用户注册
        :param request: 请求对象
        :return: 注册结果
        """
        #接受参数

        username = request.POST.get('username')

        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        mobile = request.POST.get('mobile')
        sms_code_client = request.POST.get('sms_code')
        allow = request.POST.get('allow')

        # 校验参数
        # 判断参数是否齐全
        if not all([username, password, password2, mobile, allow]):
            return http.HttpResponseForbidden('缺少必传参数')
        # 判断用户名是否是5-20个字符
        if not re.match(r'^[a-zA-Z0-9_-]{5,20}$', username):
            return http.HttpResponseForbidden('请输入5-20个字符的用户名')
        # 判断密码是否是8-20个数字
        if not re.match(r'^[0-9A-Za-z]{8,20}$', password):
            return http.HttpResponseForbidden('请输入8-20位的密码')
        # 判断两次密码是否一致
        if password != password2:
            return http.HttpResponseForbidden('两次输入的密码不一致')
        # 判断手机号是否合法
        if not re.match(r'^1[3-9]\d{9}$', mobile):
            return http.HttpResponseForbidden('请输入正确的手机号码')
        # 判断是否勾选用户协议
        if allow != 'on':
            return http.HttpResponseForbidden('请勾选用户协议')
        #判断短信验证码是否正确
        redis_conn=get_redis_connection('verify_code')
        sms_code_server=redis_conn.get('sms_%s' % mobile)
        if sms_code_server is None:
            return render(request,'register.html',{'sms_code_errmsg':'短信验证码已失效'})

        if sms_code_server.decode()!=sms_code_client:
            return render(request, 'register.html', {'sms_code_errmsg': '输入短信验证码有误'})



        # 保存注册数据：核心
        #user = User.objects.all
        try:
            user=User.objects.create_user(username=username, password=password, models=mobile)
        except DatabaseError:
            return render(request, 'register.html', {'register_errmsg': '注册失败'})

        #实现状态保持
        login(request,user)

        # 响应结果
        return redirect(reverse('contents:index'))


       #return http.HttpResponse('注册成功，重定向到首页')

class UsernameCountView(View):
    """判断用户名是否重复注册"""

    def get(self,request,username):
        """
        :param request: 请求对象
        :param username: 用户名
        :return: JSON
        """

        count=User.objects.filter(username=username).count()
        return http.JsonResponse({'code': RETCODE.OK, 'errmsg': 'OK', 'count': count})

