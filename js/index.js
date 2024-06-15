$(document).ready(function () {
    var base_url = "http://192.168.2.1";
    //待更新config
    var updatedConfig_ = {
        basic: {
            wifi: {
                ssid: "",
                password: $('#wifi_password').val(),
                enabled: false
            }
        },
        advanced: {
            mic: {
                staff_horizon: null,
                staff_vertical: null,
                customer_horizontal: null,
                customer_vertical: null,
            },
            distance_gauge: {
                time: null,
                enabled: false,
                set: null
            },
            server: {
                domain: null,
                ip: null,
                port: null
            },
            wired: {
                mac: null,
                ip: null
            }
        }
    }
    // 点击标题展开内容，并收缩其他内容
    $('.title').click(function () {
        var index = $(this).index('.title');
        var mainContent = $(".main-content").eq(index);

        if ($(this).hasClass("active")) {
            mainContent.slideUp();
            $(this).removeClass("active");
        } else {
            $(".main-content").slideUp();
            $(".title").removeClass("active");
            mainContent.slideDown();
            $(this).addClass("active");
        }
    });

    // 使用测试配置

    var testJSON = {
        "basic": {//基础配置
            "wifi": {//WIFI配置
                "ssids": [//WIFI热点列表
                    {
                        "ssid": "TP-LINK",//WIFI热点名称
                        "signal_level": "high/middle/low",//WIFI信号强度等级
                        "signal_dbm": -37,//WIFI信号强度值
                        "status": true//WIFI连接状态
                    },
                    {
                        "ssid": "TP-LINK_2",//WIFI热点名称
                        "signal_level": "high/middle/low",//WIFI信号强度等级
                        "signal_dbm": -60,//WIFI信号强度值
                        "status": false//WIFI连接状态
                    },
                    {
                        "ssid": "TP-LINK_3",//WIFI热点名称
                        "signal_level": "high/middle/low",//WIFI信号强度等级
                        "signal_dbm": -60,//WIFI信号强度值
                        "status": false//WIFI连接状态
                    }
                ],
                "ip": "192.168.20.100",//已经连接的WIFI的IP地址
                "mac": "00:1A:2B:3C:4D:5E",//WIFI的MAC地址
                "enabled": true
            }
        },
        "advanced": {//高级配置
            "mic": {//麦克风配置
                "staff_horizon": 45,//职员方向水平拾音角度
                "staff_vertical": 120,//职员方向竖直拾音角度
                "customer_horizontal": 45,//客户方向水平拾音角度
                "customer_vertical": 45//客户方向竖直拾音角度
            },
            "distance_gauge": {//感应距离配置
                "max": 200,//人体感应最大距离(厘米)
                "min": 1,//人体感应最小距离(厘米)
                "time": 10,//人体感应时间(秒)
                "enabled": true,//人体感应开关
                "set": 80//感应距离设置(厘米)
            },
            "server": {//服务器配置
                "domain": "",//网络管理平台域名
                "ip": "",//网络管理平台IP
                "port": 8080//网络管理平台端口
            },
            "wired": {//有线网络配置
                "mac": "",//有线网络MAC地址
                "ip": ""//有线网络IP地址
            }
        }
    }
    var initialConfig = testJSON;
    console.log("初始化配置", initialConfig);
    initializeForm(initialConfig);

    // 初始化表单
    function initializeForm(config) {
        // 初始化WiFi列表
        var wifiListContainer = $('#wifi-list');
        wifiListContainer.empty(); // 清空WiFi列表容器

        $.each(config.basic.wifi.ssids, function (index, wifi) {
            var statusIcon = wifi.status ? '<div class="checked"><span>已连接</span></div>' : '';
            var wifiRow = '<div class="input-row">' +
                '<span class="wifi-name">' + wifi.ssid + '</span>' +
                '<div class="status">' + statusIcon + '</div>' +
                '</div>';
            wifiListContainer.append(wifiRow);
        });

        //wifi列表选项点击事件
        wifiListContainer.on('click', '.input-row', function () {
            var isHasChecked = $(this).find('.status').has('.checked').length > 0;

            var select_img = " <img src=\"img/selected.png\" alt=\"\">"
            //判断.status是否包含div.checked ,如果包含则删除，如果不包含则添加select_img,并且把把其他非连接的div.status删除
            console.log("当前点击的wifi22", isHasChecked);



            if (isHasChecked) {

                // $(this).find('.status').remove('.checked');
                // $(this).find('.status').html(select_img);
            } else {
                //如果其他div.status不包含.checked,则删除

                $('.status').each(function () {
                    if (!$(this).has('.checked').length > 0) {
                        $(this).html('');
                    }
                });

                $(this).find('.status').html(select_img);
                //获取当前点击的ssid
                var ssid = $(this).find('.wifi-name').text();
                updatedConfig_.basic.wifi.ssid = ssid;
                console.log("当前点击的ssid", updatedConfig_);


            }






        });

        // 初始化WiFi密码输入框
        $('#wifi_password').val(config.basic.wifi.password);

        // 初始化当前IP地址和MAC地址
        $('#wifi_ip').text(config.basic.wifi.ip);
        $('#wifi_mac').text(config.basic.wifi.mac);

        // 初始化WIFI开关状态
        $('#wifi_enabled').prop('checked', config.basic.wifi.enabled);

        // 初始化麦克风角度
        setMicAngles(config.advanced.mic);

        // 初始化感应距离设置和时间
        $('#distance_gauge_set').val(config.advanced.distance_gauge.set);
        $('#distance_gauge_set_text').text(config.advanced.distance_gauge.set + "cm");
        $('#distance_gauge_time').val(config.advanced.distance_gauge.time);

        // 初始化感应开关状态
        $('#distance_gauge_enabled').prop('checked', config.advanced.distance_gauge.enabled);

        // 初始化服务器配置
        $('#server_domain').val(config.advanced.server.domain);
        $('#server_ip').val(config.advanced.server.ip);
        $('#server_port').val(config.advanced.server.port);

        // 初始化有线网络配置


        if(config.advanced.wired.mac){
            $('#wired_mac').val(config.advanced.wired.mac);
        }else {
            $("#wired_mac_error").text('未连接').show()
        }
        if(config.advanced.wired.ip){
            $('#wired_ip').val(config.advanced.wired.ip);
        }else {
            $("#wired_ip_error").text('未连接').show()
        }

    }

    // 点击重置按钮时，重新加载初始配置
    $('#basic-reset, #advanced-reset').click(function () {
        initializeForm(initialConfig);
    });

    //密码输入框事件
    $("#wifi_password").on('input', function (e) {
        updatedConfig_.basic.wifi.password = e.delegateTarget.value;
        console.log(e.delegateTarget.value);
        if (e.delegateTarget.value) {
            $("#clear-passwrod").show();
        } else {
            $("#clear-passwrod").hide();
        }


    });
    //distance_gauge_set 感应距离设置
    $("#distance_gauge_set").on('input', function (e) {
        if(e.delegateTarget.value>200||e.delegateTarget.value<1){
            e.delegateTarget.value = "";
            $("#distance_gauge_set_error").show()
        }else{
            $("#distance_gauge_set_error").hide()
            updatedConfig_.advanced.distance_gauge.set = e.delegateTarget.value;
            $("#distance_gauge_set_text").text(e.delegateTarget.value + "cm");
        }

    });
    //distance_gauge_time 感应时间
    $("#distance_gauge_time").on('input', function (e) {
       if(e.delegateTarget.value>60||e.delegateTarget.value<1){
           $("#distance_gauge_time_error").show()
           e.delegateTarget.value = "";
       }else{
           $("#distance_gauge_time_error").hide()
           updatedConfig_.advanced.distance_gauge.time = e.delegateTarget.value;
       }
    });
    var domainReg = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2,})|\[(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|\[(?:[0-9a-fA-F]{1,4}:){1,7}:|[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}])$/;
    var ipReg =  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    var portReg =/^(0|[1-9]\d{0,4}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;

    //server_domain 服务器域名
    $("#server_domain").on('input', function (e) {
        // 更精确的域名匹配正则，考虑了国际化域名

        if (domainReg.test(e.target.value)||e.target.value==="") {
            // 输入符合域名格式
            $("#server_domain_error").hide(); // 隐藏错误提示

        } else {
            // 输入不符合域名格式
            $("#server_domain_error").show(); // 显示错误提示
            // 可选择性地不清空输入，以便用户修改而非强制重填，提升体验
            // e.target.value = ""; // 如果决定立即清空输入，请取消此行注释
        }
        updatedConfig_.advanced.server.domain = e.target.value; // 保存域名

    });
    //server_ip 服务器IP
    $("#server_ip").on('input', function (e) {
        if (ipReg.test(e.target.value)||e.target.value==="") {
            // 输入符合IP格式
            $("#server_ip_error").hide(); // 隐藏错误提示

        } else {
            // 输入不符合IP格式
            $("#server_ip_error").show(); // 显示错误提示
            // 可选择性地不清空输入，以便用户修改而非强制重填，提升体验
            // e.target.value = ""; // 如果决定立即清空输入，请取消此行注释
        }
        updatedConfig_.advanced.server.ip = e.target.value; // 保存IP
    });
    $("#server_port").on('input', function (e) {
        if (portReg.test(e.target.value)||e.target.value==="") {
            // 输入符合端口格式
            $("#server_port_error").hide(); // 隐藏错误提示

        }else{
            $("#server_port_error").show();
        }
        updatedConfig_.advanced.server.port = e.target.value;
    })

    // 点击清除密码按钮
    $("#clear-passwrod").click(function () {
        $("#wifi_password").val("");
        $("#clear-passwrod").hide();
        updatedConfig_.basic.wifi.password = "";
    });
    //点击密码的小眼睛按钮
    $("#key-password").click(function () {
        var type = $("#wifi_password").attr('type')
        if(type==="password"){
            $("#wifi_password").attr('type', 'text');
            // $("#key-password").attr('src', 'img/key-open.png');
        }else{
            $("#wifi_password").attr('type', 'password');
            // $("#key-password").attr('src', 'img/key-close.png');
        }
        console.log(type)
    });

//staff_horizon职员方向水平拾音角度
$('#staff_horizon div').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var angle = $(this).find('span').text();
    console.log("当前点击的职员方向水平拾音角度", updatedConfig_);
    updatedConfig_.advanced.mic.staff_horizon = parseInt(angle);
});
//staff_vertical职员方向垂直拾音角度
$('#staff_vertical div').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var angle = $(this).find('span').text();
    console.log("当前点击的职员方向垂直拾音角度", updatedConfig_);
    updatedConfig_.advanced.mic.staff_vertical = parseInt(angle);
});
//customer_horizontal客户方向水平拾音角度
$('#customer_horizontal div').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var angle = $(this).find('span').text();
    console.log("当前点击的客户方向水平拾音角度", updatedConfig_);
    updatedConfig_.advanced.mic.customer_horizontal = parseInt(angle);
});
//customer_vertical客户方向垂直拾音角度
$('#customer_vertical div').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var angle = $(this).find('span').text();
    console.log("当前点击的客户方向垂直拾音角度", updatedConfig_);
    updatedConfig_.advanced.mic.customer_vertical = parseInt(angle)
})


    // 点击基础配置提交按钮
    $('#basic-submit').click(function () {
        console.log("当前点击的ssid", updatedConfig_.basic.wifi.ssid);
        if (updatedConfig_.basic.wifi.ssid && updatedConfig_.basic.wifi.password) {
            submitForm()
        } else {
            alert("请选择一个wifi并填写密码")
        }

    });
    // 点击高级配置提交按钮
    $('#advanced-submit').click(function () {
        //判断服务器域名、IP、端口如果非空时是否符合正则

        if (validateServerDetails(updatedConfig_.advanced.server.domain, updatedConfig_.advanced.server.ip, updatedConfig_.advanced.server.port)) {
            submitForm()
        } else {
            alert("请检查服务器域名、IP、端口是否正确")
        }



    });
    function validateServerDetails(serverDomain, serverIP, serverPort) {
        var isValid = true;

        if (serverDomain) {
            isValid &= domainReg.test(serverDomain);
        }

        if (serverIP) {
            isValid &= ipReg.test(serverIP);
        }

        if (serverPort) {
            isValid &= portReg.test(serverPort);
        }

        return isValid;
    }

    //提交表单
    function submitForm() {
     
        var updatedConfig = {
            basic: {
                wifi: {
                    ssid: updatedConfig_.basic.wifi.ssid ||initialConfig.basic.wifi.ssids.filter(ssid=>ssid.status===true)[0].ssid,
                    password: updatedConfig_.basic.wifi.password || $('#wifi_password').val(),
                    enabled: $('#wifi_enabled').is(':checked')
                }
            },
            advanced: {
                mic: {
                    staff_horizon: updatedConfig_.advanced.mic.staff_horizon||initialConfig.advanced.mic.staff_horizon,
                    staff_vertical: updatedConfig_.advanced.mic.staff_vertical||initialConfig.advanced.mic.staff_vertical,
                    customer_horizontal:updatedConfig_.advanced.mic.customer_horizontal||initialConfig.advanced.mic.customer_horizontal,
                    customer_vertical: updatedConfig_.advanced.mic.customer_vertical||initialConfig.advanced.mic.customer_vertical
                },
                distance_gauge: {
                    set: parseInt($('#distance_gauge_set').val())||initialConfig.advanced.distance_gauge.set,
                    time: parseInt($('#distance_gauge_time').val()||initialConfig.advanced.distance_gauge.time),
                    enabled: $('#distance_gauge_enabled').is(':checked')||initialConfig.advanced.distance_gauge.enabled
                },
                server: {
                    domain: $('#server_domain').val()||initialConfig.advanced.server.domain,
                    ip: $('#server_ip').val()||initialConfig.advanced.server.ip,
                    port: $('#server_port').val()||initialConfig.advanced.server.port
                },
                wired: {
                    mac: $('#wired_mac').val()||initialConfig.advanced.wired.mac,
                    ip: $('#wired_ip').val()||initialConfig.advanced.wired.ip
                }
            }
        };
        console.log("提交表单", updatedConfig);
        // 发送更新配置的请求
        /*$.ajax({
            url: base_url + "/config",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(updatedConfig),
            success: function (response) {
                if (response.result === 0) {
                    alert("配置提交成功");
                } else {
                    alert("配置提交失败");
                }
            },
            error: function (err) {
                console.error("配置提交失败", err);
                alert("配置提交失败");
            }
        });*/
    }

    // 设置麦克风角度函数
    function setMicAngles(micConfig) {
        $('#staff_horizon div, #staff_vertical div, #customer_horizontal div, #customer_vertical div').removeClass('active');

        $('#staff_horizon div').each(function () {
            var angle = parseInt($(this).find('span').text());
            if (angle === micConfig.staff_horizon) {
                $(this).addClass('active');
            }
        });

        $('#staff_vertical div').each(function () {
            var angle = parseInt($(this).find('span').text());
            if (angle === micConfig.staff_vertical) {
                $(this).addClass('active');
            }
        });

        $('#customer_horizontal div').each(function () {
            var angle = parseInt($(this).find('span').text());
            if (angle === micConfig.customer_horizontal) {
                $(this).addClass('active');
            }
        });

        $('#customer_vertical div').each(function () {
            var angle = parseInt($(this).find('span').text());
            if (angle === micConfig.customer_vertical) {
                $(this).addClass('active');
            }
        });
    }

    // 初始化音频上下文
    function startAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 模拟发送录音请求，并使用本地 MP3 文件
    function startRecording() {
        $.ajax({
            url: '../media/test.mp3',
            method: 'GET',
            responseType: 'arraybuffer',
            success: function (data, textStatus, xhr) {
                decodeAudio(data);
            },
            error: function (xhr, textStatus, error) {
                console.error('加载 MP3 文件失败', error);
            }
        });
    }

    // 解码音频流
    function decodeAudio(arrayBuffer) {
        audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            processAudioBuffer(audioBuffer);
        }, function (e) {
            console.error('解码音频失败', e);
        });
    }

    // 处理音频缓冲区，计算左右声道的能量值
    function processAudioBuffer(audioBuffer) {
        var channelDataLeft = audioBuffer.getChannelData(0); // 左声道
        var channelDataRight = audioBuffer.getChannelData(1); // 右声道

        // 计算左声道和右声道的能量值
        var energyLeft = calculateEnergy(channelDataLeft);
        var energyRight = calculateEnergy(channelDataRight);

        // 在页面上显示左右声道的能量值（示例）
        displayEnergy(energyLeft, energyRight);
    }

    // 计算声道的能量值
    function calculateEnergy(channelData) {
        var sumOfSquares = 0;
        for (var i = 0; i < channelData.length; i++) {
            sumOfSquares += channelData[i] * channelData[i];
        }
        var rms = Math.sqrt(sumOfSquares / channelData.length);
        return rms;
    }

    // 显示左右声道的能量值（示例）
    function displayEnergy(energyLeft, energyRight) {
        console.log('左声道能量值:', energyLeft);
        console.log('右声道能量值:', energyRight);

        // 在页面上显示示例
        // 这里可以根据实际需要将能量值显示在页面的某个元素中
    }

    // 点击开始按钮开始模拟录音
    $('#start').click(function () {
        startAudioContext();
        startRecording();
    });

    // 点击停止按钮停止录音（如果有需要的话）
    $('#stop').click(function () {
        // 停止录音的相关逻辑（如果有需要的话）
    });

});
