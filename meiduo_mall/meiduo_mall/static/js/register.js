//创建Vue对象
let vm = new Vue({
    el:'#app',//通过id选择器找到绑定的html内容
    delimiters: ['[[', ']]'],
    data:{ //数据对象
        //v-model
        username:'',
        password:'',
        password2:'',
        mobile:'',
        allow:'',
        image_code_url:'',
        image_code:'',
        sms_code_tip:'获取短信验证码',
        send_flag:false,


        //v-show
        error_name:false,
        error_password:false,
        error_password2:false,
        error_mobile:false,
        error_allow:false,
        error_image_code:false,
        error_sms_code:false,

        //v-error_message
        error_name_message:'',
        error_mobile_message:'',
        error_image_code_message:'',
        error_sms_code_message:'',
    },

    mounted(){
        //生成图形验证码
        this.generate_image_code();
    },

    methods:{//定义和实现事件方法
        //校验用户名
        check_username(){
            let re= /^[a-zA-Z0-9_-]{5,20}$/;
            if (re.test(this.username)){
                this.error_name=false;
            }else{
                this.error_name_message='请输入5-20个字符的用户名';
                this.error_name= true;
            }

            //用户名是否重复注册
            if (this.error_name == false){
                let url = '/usernames/' + this.username + '/count/';
                axios.get(url,{
                    responseType:'json'
                })
                .then(response=>{
                    if (response.data.count==1){
                        this.error_name_message = '用户名已存在';
                        this.error_name = true;
                    }else{
                        this.error_name = false;
                    }
                })
                .catch(error=>{
                    console.log(error.response);
                })
            }
        },

        //校验密码
        check_password(){
            let re = /^[0-9A-Za-z]{8,20}$/;
            if (re.test(this.password)){
                this.error_password=false;
            }else{
                this.error_password = true;
            }
        },

        // 校验确认密码
        check_password2(){
            if(this.password != this.password2) {
                this.error_password2 = true;
            } else {
                this.error_password2 = false;
            }
        },

        // 校验手机号
        check_mobile(){
            let re = /^1[3-9]\d{9}$/;
            if(re.test(this.mobile)) {
                this.error_mobile = false;
            } else {
                this.error_mobile_message = '您输入的手机号格式不正确';
                this.error_mobile = true;
            }

        },

        // 生成图形验证码
        generate_image_code(){
            // 生成UUID。generateUUID() : 封装在common.js文件中，需要提前引入
            this.uuid = generateUUID();
            // 拼接图形验证码请求地址
            this.image_code_url = "/image_codes/" + this.uuid + "/";
        },

        //校验图形验证码
        check_image_code(){
            if(this.image_code.length !=4 ){
                this.error_image_code_message='请输入图形验证码';
                this.error_image_code=true;
            }else{
                this.error_image_code=false;
            }
        },

        //发送短信验证码
        send_sms_code(){
            if (this.send_flag==true){
                return;
            }
            this.send_flag = true;

            this.check_mobile();
            this.check_image_code();
            if (this.error_mobile==true || this.error_image_code==true){
                this.send_false=false;
                return;
            }


            let url='/sms_codes/'+ this.mobile +'/?image_code='+this.image_code+'&uuid='+this.uuid;

            axios.get(url,{
                responseType:'json'
            })
                .then(response=>{
                    if (response.data.code=='0'){
                        let num =  60;
                        let t=setInterval(()=>{
                            if (num==1){//倒计时即将结束
                                //停止回调函数的执行
                                clearInterval(t);
                                this.sms_code_tip='获取短信验证码';
                                this.generate_image_code();
                                this.send_flag=false;
                            }else{//正在倒计时
                                num-=1;
                                this.sms_code_tip=num+'秒';
                            }

                        },1000)

                    }else{
                        if (response.data.code=='4001'){//图形验证码错误
                            this.error_image_code_message=response.data.errmsg;
                            this.error_image_code=true;
                        }else{
                            this.error_sms_code_message=response.data.errmsg;
                            this.error_sms_code=true;
                        }


                        this.send_false=false;
                    }
                })
                .catch(error=>{
                    console.log(error.response);
                    this.send_false=false;
                })
        },

        //验证短信验证码
        check_sms_code(){
            if(this.sms_code.length != 6){
                this.error_sms_code_message = '请填写短信验证码';
                this.error_sms_code = true;
            } else {
                this.error_sms_code = false;
            }
        },

        // 校验是否勾选协议
        check_allow(){
            if(!this.allow) {
                this.error_allow = true;
            } else {
                this.error_allow = false;
            }
        },

        // 监听表单提交事件
        on_submit(){
            this.check_username();
            this.check_password();
            this.check_password2();
            this.check_mobile();
            this.check_sms_code()
            this.check_allow();

            if(this.error_name == true || this.error_password == true || this.error_password2 == true
            || this.error_mobile == true || this.error_allow == true || this.error_sms_code == true) {
            // 禁用表单的提交
            window.event.returnValue = false;
        }

        },

    }

});