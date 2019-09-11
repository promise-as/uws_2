/**
 * @ time 2017/7/31
 * @ rely on jquery-1.12.3.min.js
 * @ version 2.0.0
 * @ This is a public form submission file that works on www.thea.cn
 */

/**********************************************分割线******************************************************/

!function(window){
    var
        // 正则
        theaRegExp = {
            // 检测手机号码
            checkPhone : /^1[345678]\d{9}$/,
            // 检测邮箱
            checkEmail : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            // 只能最少输入4个字符
            checkWordsFourNum : /^.{4,}$/,
            // 验证qq
            checkQQ : /^\d{5,10}$/,
            // 验证微信号
            checkWechat : /^[a-zA-Z0-9]{5,}$/,
            // 验证身份证
            checkCard : /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        },

        // 表单提交地址
        formUrl = {
            // 面授
            ms : 'https://px.thea.cn/Listen/ListenAddAll'
        },

        // 默认参数
        defaultOpions = {
            // 面授
            ms : 'cityid-areaid-ntypeid-schoolid-courseid-classid-vip-content'
        },
        // 方法

        m = {

            // 解析不同的业务默认参数
            /**
             * Return an object
             * cityid-areaid-ntypeid-schoolid-courseid-classid-vip-content
             */
            defaultParameter : function(){
                var dataId = $('.defaults_dataid').eq(0).attr('data-id');
                var idArr = dataId.split('-');
                var idkey = defaultOpions['ms'].split('-');
                var defaultJson = {};
                for (var i = 0; i < idArr.length; i++) {
                    defaultJson[idkey[i]] = idArr[i];
                };
                return defaultJson;
            },
            // 根据默认数据包含的城市id来调取城市
            // par 是接受传过来的区域数据，c是默认城市id；
            getCity : function(par,c){
                var defaultsC = c;
                var $par = par;
                // 不接收默认城市
                if ($('.user-city',$par).size()>=1 && $('.user-city',$par).hasClass('custom-city') ) return;
                // 没有默认城市
                if (defaultsC == 0 && $('.user-city',$par).size()>=1) {
                    $.ajax({
                        url:'https://px.thea.cn/Px/City/ajaxGetProxyCity',
                        type:'get',
                        dataType:'jsonp',
                        jsonp: "callback",
                        jsonpCallback:'call'+(new Date()).getTime(),
                        success:function($data){
                            if($data){
                                var $html = '';
                                var $length = 0;
                                for(ciyt in $data){
                                    $length++;
                                    $html +='<option value="'+ $data[ciyt]['id'] +'">'+ $data[ciyt]['cityname'] +'</option>';
                                }
                                $('.user-city',$par).empty().html($html);
                                // 默认第一个
                                m.getArea($par,$data[0]['id']);
                            }else{
                                console.log('city get error');
                            }
                        }
                    })
                    // 选择测试行为
                    m.selectCity($par);
                }else if (defaultsC != 0) {           //有默认城市
                    // 请求城市
                    if ($('.user-city',$par).size()>=1) {
                        $.ajax({
                            url:'https://px.thea.cn/Px/City/ajaxGetCityInfo/id/'+defaultsC,
                            type:'get',
                            dataType:'jsonp',
                            jsonp: "callback",
                            jsonpCallback:'call'+(new Date()).getTime(),
                            success:function($data){
                                if ($data) {
                                    $('.user-city',$par).attr('disabled','disabled')
                                    $('.user-city',$par).empty().html('<option value="'+ defaultsC +'">'+ $data['cityname'] +'</option>')
                                }else{
                                    console.log('city get error');
                                }
                            }
                        });
                    };
                    m.getArea($par,defaultsC);
                };
            },
            // 根据城市id调取城市内的区域
            getArea : function(par,c){
                if ($('.user-area',par).size()>=1 && c != 0) {
                    // 请求地区；
                    $.ajax({
                        url:'https://px.thea.cn/Px/City/ajaxGetArea/id/'+ c,
                        type:'get',
                        dataType:'jsonp',
                        jsonp: "callback",
                        jsonpCallback:'call'+(new Date()).getTime(),
                        success:function($data){
                            if($data){
                                var $ahtml = '';
                                var $alength = 0;
                                for(area in $data){
                                    $alength++;
                                    $ahtml +='<option value="'+ $data[area]['id'] +'">'+ $data[area]['areaname'] +'</option>';
                                }
                                $('.user-area',par).empty().html($ahtml);
                            }
                        }
                    })
                };
            },

            // 城市发生改变
            selectCity : function (par){
                par.each(function(){
                    var $this = $(this);
                    $('.user-city',$this).change(function(){
                        var defaultsC = $('option:selected',$this).val();
                        m.getArea($this,defaultsC);
                    });
                })
            },

            // 表单行为
            formBehavior : function(par){
                $('input',par).each(function(){
                    var $this = $(this);
                    if ($this.attr('type') == "submit") return;
                    if (!$this.attr('placeholder')) {
                        $this.attr('placeholder','');
                    }
                    // 模拟placeholder
                    // 去除input的样式
                    isPlaceholder(function(){
                        var $placeholder = $this.attr('placeholder');
                        $this.css('color','#888');
                        $this.attr('value',$placeholder);
                        $this.focus(function(){
                            if($this.val() == $this.attr('placeholder')){
                                $this.val('');
                                $this.css('color','#333');
                            }
                        });
                        $this.blur(function(){
                            if($this.val() == ""){
                                $this.val($this.attr('placeholder'));
                                $this.css('color','#888');
                            }
                        })
                    })
                    $this.focus(function(){
                        if ($this.hasClass('error')) {
                            $this.removeClass('error');
                        };
                    });
                    // 只能输入数字
                    if($this.hasClass('user-tel') || $this.hasClass('user-qq') || $this.hasClass('input-number')){
                        $this.keyup(function(){
                            if(this.value.length==1){
                                this.value=this.value.replace(/[^1-9]/g,'')
                            }
                            else{
                                this.value=this.value.replace(/\D/g,'')
                            }
                        })
                    }
                })
                $('select',par).each(function(){
                    var $this = $(this);
                    $this.click(function(){
                        $this.removeClass('error');
                    })
                })
                $('textarea',par).each(function(){
                    var $this = $(this);
                    if (!$this.attr('placeholder')) {
                        $this.attr('placeholder','');
                    }
                    // 模拟placeholder
                    // 去除input的样式
                    isPlaceholder(function(){
                        var $placeholder = $this.attr('placeholder');
                        $this.css('color','#888');
                        $this.text($placeholder);
                        $this.focus(function(){
                            if($this.text() == $this.attr('placeholder')){
                                $this.val('');
                                $this.css('color','#333');
                            }
                        });
                        $this.blur(function(){
                            if($this.text() == ""){
                                $this.val($this.attr('placeholder'));
                                $this.css('color','#888');
                            }
                        })
                    })
                    $this.focus(function(){
                        if ($this.hasClass('error')) {
                            $this.removeClass('error');
                        };
                    });
                })
            },

            // 检查表单是否为空
            checkNull : function(par){
                var $input = $('input',par);
                var $textarea = $('textarea',par);
                var $select = $('select',par);
                $input.each(function(){
                    var $this = $(this);
                    var $val = $(this).val();
                    var $placeholder = $this.attr('placeholder');
                    if (($this.hasClass('input-required') || !$this.hasClass('input-required') && !$this.hasClass('no-required')) && ($this.attr('type') == "text" || $this.attr('type') == "tel")) {
                        isPlaceholder(function(){
                            if ($val == $placeholder) {
                                $this.addClass('error');
                            }
                        },function(){
                            if ($val == '') {
                                $this.addClass('error');
                            }
                        })
                    }
                })
                $select.each(function(){
                    var $this = $(this);
                    if ($this.hasClass('input-required') || !$this.hasClass('input-required') && !$this.hasClass('no-required')) {
                        var $val = $('option:selected',$this).val();
                        if ($val == 0) {
                            $this.addClass('error');
                        }
                    }
                })
                $textarea.each(function(){
                    var $this = $(this);
                    var $val = $this.val();
                    var $placeholder = $this.attr('placeholder');
                    if ($this.hasClass('input-required') || !$this.hasClass('input-required') && !$this.hasClass('no-required')) {
                        isPlaceholder(function(){
                            if ($val == $placeholder) {
                                $this.addClass('error');
                            }
                        },function(){
                            if ($val == '') {
                                $this.addClass('error');
                            }
                        })
                    }
                })
            },

            // 表单选项错误时的弹窗
            errorPopup : function(ele,val){
                var dataAlert;
                if (ele.attr('data-alert') && ele.attr('data-alert') !="") {
                    dataAlert = ele.attr('data-alert');
                }else{
                    dataAlert = val;
                }
                return dataAlert;
            },

            // 读取form表单中包含的字段名,生成对象
            readFields : function(ele,o){
                // 城市
                if ($('.user-city',ele).size()>=1) {
                    if ($('.user-city option:selected',ele).val() != 0) {
                        o['cityid'] = $('.user-city option:selected',ele).val();
                    }
                };
                // 区域
                if ($('.user-area',ele).size()>=1) {
                    if ($('.user-area option:selected',ele).val() != 0) {
                        o['areaid'] = $('.user-area option:selected',ele).val();
                    }
                };
                // 咨询内容
                if ($('.user-con',ele).size()>=1) {
                    var $userCon = $('.user-con',ele);
                    var $content = o['content'];
                    var $len = $userCon.size();
                    for (var i = 0; i < $len; i++) {
                        if (!$userCon.eq(i).hasClass('input-select') && $userCon.eq(i).val() != $userCon.eq(i).attr('placeholder') && $userCon.eq(i).val() != o['content']) {
                            $content += "丶" + $userCon.eq(i).val();
                        }
                        if ($userCon.eq(i).hasClass('input-select') && $('option:selected',$userCon.eq(i)).val() != 0) {
                            $content += "丶" + $('option:selected',$userCon.eq(i)).val();
                        }
                        if ($userCon.eq(i).hasClass('input-textarea') && $userCon.eq(i).val() != $userCon.eq(i).attr('placeholder')) {
                            $content += "丶" + $userCon.eq(i).val();
                        }
                    };
                    o['content'] = $content;
                }
                // 用户姓名
                o['contact'] = $('.user-name',ele).val();

                // 联系电话
                o['mobile'] = $('.user-tel',ele).val();

                // 性别
                if ($('.user-sex',ele).size()>=1) {
                    o['sex'] = $(':radio[name="sex"]:checked').val();
                }

                // 邮箱
                if ($('.user-email',ele).size()>=1 && $('.user-email',ele).val() != $('.user-email',ele).attr('placeholder')) {
                    o['email'] = $('.user-email',ele).val();
                }

                // qq
                if ($('.user-qq',ele).size()>=1 && $('.user-qq',ele).val() != $('.user-qq',ele).attr('placeholder')) {
                    o['qq'] = $('.user-qq',ele).val();
                }

                // wechat
                if ($('.user-wechat',ele).size()>=1 && $('.user-wechat',ele).val() != $('.user-wechat',ele).attr('placeholder')) {
                    o['wechat'] = $('.user-wechat',ele).val();
                }

                // 身份证
                if ($('.user-card',ele).size()>=1 && $('.user-card',ele).val() != $('.user-card',ele).attr('placeholder')) {
                    o['card'] = $('.user-card',ele).val();
                }
                return o;
            }
        };
    // 判断是否兼容placeholder
    function isPlaceholder(a,b){
        var input = document.createElement("input");
        if ('placeholder' in input) {
            b && b();
        }else{
            a && a();
        }
    }
    // 表单提交
    var theaMsForm = function(ele,call){
        ele ? ele : ele = $('.sign-in');
        ele.each(function(){
            var $form = $(this);
            // 获取表单默认内容
            var defaults = m.defaultParameter();
            m.getCity($form,defaults['cityid']);
            if (defaults['content'] != 0 || defaults['content'] != '0') {
                $('.user-accept').val(defaults['content']);
            };
            // 模拟表单行为
            m.formBehavior($form);
            // 判断是否积分入户页面
            if(defaults.cityid == 2 && defaults.ntypeid == 73){
                // 特别表单提交
                $("head").append('<link rel="stylesheet" href="https://img.thea.cn/public/css/new_form.css">');
                $form.append('<input type="hidden" name="msg_remarks" value="" />')
                var reg={
                    name:/^[\u4E00-\u9FFF]+$/,
                    phone:/^1[3|4|5|6|7|8|9]\d{9}$/
                }
                $form.submit(function(){
                    console.log(11111);
                    //var msg_webID     = siteId ? siteId : msg_webID_val;
                    var msg_username  = $('.user-name',$form);
                    var msg_userphone = $('.user-tel',$form);
                    var msg_remarks   = $('input[name="msg_remarks"]',$form);
                    var msg_other     = $(".user-con",$form);
                    var errorMsg = "",Lacks ="";
                    function alert(){//给移动端自定义弹出框
                        $("body").append("<div id='msg'><img src='https://img.thea.cn/public/images/warning.png'><p>" + errorMsg + "</p><a href='#nogo'>确定</a></div><div id='msgbg'></div>");
                        var top = ($(window).height()-$("#msg").height())/3;
                        var left = ($(window).width()-$("#msg").width())/2;
                        $("#msg").css({
                            'top':top,
                            'left':left
                        });
                        $("#msg a").click(function(){
                            $("#msg,#msgbg").remove();
                            if(Lacks == 1){
                                msg_username.focus();
                            }else if(Lacks == 2){
                                msg_userphone.focus();
                            }
                        });
                    }
                    if(!reg.name.test(msg_username.val())){
                        errorMsg = "请填写您的姓名，我们为您进行备注。";
                        Lacks = 1;
                        alert();
                        return false;
                    }
                    if(!reg.phone.test(msg_userphone.val())){
                        errorMsg = "请正确填写您的手机号，以便接受资料。";
                        Lacks = 2;
                        alert();
                        return false;
                    }
                    //------------------------------------------------------------------------------------------------------------------------------
                    var result="";//另一种选项
                    //获取当前时间
                    var myDate = new Date();
                    var mysj = myDate.toLocaleString( );
                    result += "【"+"留言时间："+mysj+"】";
                    msg_remarks.val(result);
                    //------------------------------------------------------------------------------------------------------------------------------
                    msg_other.each(function(){
                        //判断其他控件是否属于单选和多选
                        if($(this).attr("type")=="radio"||$(this).attr("type")=="checkbox"){
                            if($(this).is(':checked')){
                                msg_remarks.val(msg_remarks.val()+"【"+ $(this).val() +"】");
                            }
                        }else{
                            msg_remarks.val(msg_remarks.val()+"【"+ $(this).val() +"】");
                        }
                    });
                    console.log(msg_remarks.val());
                    if(typeof(clockTime)=="undefined"){clockTime=60000;}
                    $.getJSON("https://jylz.zhntu.cn/api.php?op=add_msg&callback=?",{
                        "msg_webID": 1,
                        "msg_url": document.location.href,
                        "msg_remarks": msg_remarks.val(),
                        "msg_username": msg_username.val(),
                        "msg_userphone": msg_userphone.val()
                    },function(json){
                        if(json==401){
                            errorMsg = "网站号无效，提交信息不成功，请联系我们的客服人员，谢谢。";
                            alert();
                            msg_remarks.val(null);
                            return false;
                        }
                        if(json==402){
                            errorMsg = "我们已经记录您提交的信息，请不要重复提交，谢谢。";
                            alert();
                            msg_remarks.val(null);
                            return false;
                        }
                        if(json==1){
                            errorMsg = "您已经提交成功。";
                            alert();
                            msg_remarks.val(null);
                        }
                    });
                    return false;
                })
            }
            else{
                // 正常表单提交
                $form.submit(function(){
                    m.checkNull($form);
                    // 表单判断
                    if ($('.error',$form).size()>0) {
                        alert('请完善资料');
                        return false;
                    }else if(!theaRegExp.checkPhone.test($('.user-tel',$form).val())){  // 检测手机号码是否正确
                        var $this = $('.user-tel',$form);
                        $this.focus();
                        alert(m.errorPopup($this,'您输入的手机号码格式不正确'));
                        return false;
                    }else if($('.user-qq',$form).size()>=1 && $('.user-qq',$form).val() != "" && $('.user-qq',$form).val() != $('.user-qq',$form).attr('placeholder') && !theaRegExp.checkQQ.test($('.user-qq',$form).val())){
                        var $this = $('.user-qq',$form);
                        $this.focus();
                        alert(m.errorPopup($this,'您输入的qq号码格式不正确'));
                        return false;
                    }else if($('.user-wechat',$form).size()>=1 && $('.user-wechat',$form).val() != "" && $('.user-wechat',$form).val() != $('.user-wechat',$form).attr('placeholder') && !theaRegExp.checkWechat.test($('.user-wechat',$form).val())){
                        var $this = $('.user-wechat',$form);
                        $this.focus();
                        alert(m.errorPopup($this,'您输入的微信号格式不正确'));
                        return false;
                    }else if($('.user-email',$form).size()>=1 && $('.user-email',$form).val() != "" && $('.user-email',$form).val() != $('.user-email',$form).attr('placeholder') && !theaRegExp.checkEmail.test($('.user-email',$form).val())){
                        var $this = $('.user-email',$form);
                        $this.focus();
                        alert(m.errorPopup($this,'您输入的邮箱格式不正确'));
                        return false;
                    }else if($('.user-card',$form).size()>=1 && $('.user-card',$form).val() != "" && $('.user-card',$form).val() != $('.user-card',$form).attr('placeholder') && !theaRegExp.checkCard.test($('.user-card',$form).val())){
                        var $this = $('.user-card',$form);
                        $this.focus();
                        alert(m.errorPopup($this,'您输入的身份证号码格式不正确'));
                        return false;
                    }

                    var d = m.defaultParameter();
                    var json = m.readFields($form,d);

                    //表单来源位置
                    if($("input[name='position']",$form).val()){
                        json['position'] = $("input[name='position']",$form).val();
                    }

                    $.ajax({
                        url:formUrl.ms,
                        type:'get',
                        async: true,
                        data:json,
                        dataType:'jsonp',
                        jsonp: "callback",
                        jsonpCallback:"call",
                        success:function($data){
                            if (call) {
                                call($data);
                            }
                            if($data.flag == 'ok'){
                                alert($data.message);
                            }else if($data.flag == 'no'){
                                alert($data.message);
                            }
                        },
                        error:function(){
                            console.log('error');
                            alert('请检查您提交的信息是否有误');
                        }
                    });
                    return false;
                });

            }
        });
    };
    window.theaMsForm = theaMsForm;
}(window)