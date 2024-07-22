$(document).ready(function () {
    var base_url = "http://192.168.2.1";
    const body = document.body;

    // 检测系统的配色方案并应用相应的类
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    // 监听系统的配色方案变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
            body.classList.add('dark-mode');
            alert("Dark mode enabled");
        } else {
            alert("Dark mode disabled");
            body.classList.remove('dark-mode');
        }
    });
    var audio_download_url = "";
    //待更新config
    let updatedConfig_ = {
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

// $(".box-row").click(function () {
//     var index = $(this).index(".box-row");
//     var mainContent = $(".main-content").eq(index);
//
//     if ($(this).find('.title').hasClass("active")) {
//         $(".main-content").slideUp();
//         $(this).find('.title').removeClass("active");
//     } else {
//         $(".main-content").slideUp();
//         $(".title").removeClass("active");
//         $(this).find('.main-content').slideDown()
//         $(this).find('.title').addClass("active");
//     }
// });
    // 使用测试配置

    let testJSON ={
        "basic": {
            "wifi": {
                "ip": "192.168.0.124",
                "mac": "50:41:1C:39:CD:AE",
                "enabled": true,
                "ssids": [
                    {
                        "ssid": "VIP888",
                        "signal_level": "high",
                        "signal_dbm": -32,
                        "status": false
                    },
                    {
                        "ssid": "huixia2.4G",
                        "signal_level": "high",
                        "signal_dbm": -31,
                        "status": true
                    },
                    {
                        "ssid": "huixia2.4G",
                        "signal_level": "high",
                        "signal_dbm": -36,
                        "status": false
                    },
                    {
                        "ssid": "ChinaNet-2NZk",
                        "signal_level": "middle",
                        "signal_dbm": -40,
                        "status": false
                    },
                    {
                        "ssid": "87003",
                        "signal_level": "middle",
                        "signal_dbm": -58,
                        "status": false
                    },
                    {
                        "ssid": "pj&zh",
                        "signal_level": "low",
                        "signal_dbm": -63,
                        "status": false
                    },
                    {
                        "ssid": "ChinaNet-Tpki",
                        "signal_level": "low",
                        "signal_dbm": -65,
                        "status": false
                    },
                    {
                        "ssid": "ChinaNet-Tpki",
                        "signal_level": "low",
                        "signal_dbm": -66,
                        "status": false
                    },
                    {
                        "ssid": "86002",
                        "signal_level": "low",
                        "signal_dbm": -68,
                        "status": false
                    },
                    {
                        "ssid": "ChinaNet-3591",
                        "signal_level": "low",
                        "signal_dbm": -70,
                        "status": false
                    },
                    {
                        "ssid": "87001",
                        "signal_level": "low",
                        "signal_dbm": -72,
                        "status": false
                    },
                    {
                        "ssid": "87005",
                        "signal_level": "low",
                        "signal_dbm": -73,
                        "status": false
                    },
                    {
                        "ssid": "86001",
                        "signal_level": "low",
                        "signal_dbm": -78,
                        "status": false
                    },
                    {
                        "ssid": "86003",
                        "signal_level": "low",
                        "signal_dbm": -78,
                        "status": false
                    },
                    {
                        "ssid": "HJGY-6",
                        "signal_level": "low",
                        "signal_dbm": -80,
                        "status": false
                    }
                ]
            }
        },
        "advanced": {
            "mic": {
                "staff_horizon": 30,
                "staff_vertical": 30,
                "customer_horizontal": 30,
                "customer_vertical": 30
            },
            "distance_gauge": {
                "max": 200,
                "min": 1,
                "time": 2,
                "enabled": true,
                "set": 150
            },
            "server": {
                "domain": "36.139.39.189",
                "ip": "36.139.39.189",
                "port": 0
            },
            "wired": {
                "ip": "0.0.0.0",
                "mac": "0A:0C:11:22:33:44"
            }
        }
    }
    let initialConfig = {};
    $.ajax({
        url: base_url + "/config",
        type: "GET",
        contentType: "application/json",
        success: function (response) {
            console.log("获取配置成功",response)
            initialConfig = JSON.parse(JSON.stringify(response)); // 深拷贝
            updatedConfig_ = JSON.parse(JSON.stringify(initialConfig)); // 深拷贝
            console.log("初始化配置", response);
            initializeForm(updatedConfig_);
        },
        error: function (err) {
            console.error("获取配置失败", err);

        }
    });
    initialConfig = JSON.parse(JSON.stringify(testJSON)); // 深拷贝
    updatedConfig_ = JSON.parse(JSON.stringify(initialConfig)); // 深拷贝
    console.log("初始配置initialConfig", initialConfig)
    initializeForm(updatedConfig_);


    // 初始化表单
    function initializeForm(config) {
        console.log("初始化配置",config)
        // updatedConfig_=config
        updatedConfig_.advanced = JSON.parse(JSON.stringify(config.advanced)); // 深拷贝
        updatedConfig_.basic = JSON.parse(JSON.stringify(config.basic)); // 深拷贝
        // 初始化WiFi列表
        var wifiListContainer = $('#wifi-list');
        wifiListContainer.empty(); // 清空WiFi列表容器

        $.each(config.basic.wifi.ssids, function (index, wifi) {
            var statusIcon = wifi.status===true ? '<div class="checked"><span>已连接</span></div>' : '';
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
            var hasChecked = '<div class="checked"><span>已连接</span></div>'
            //判断.status是否包含div.checked ,如果包含则删除，如果不包含则添加select_img,并且把把其他非连接的div.status删除
            console.log("当前点击的wifi", isHasChecked);

            if (isHasChecked) {
                $('.status').each(function () {
                    if ($(this).has('.checked').length > 0) {
                        $(this).html(select_img+hasChecked);
                    }else{
                        $(this).html('');
                    }
                });

            } else {
                $('.status').each(function () {
                    if (!$(this).has('.checked').length > 0) {
                        $(this).html('');
                    }else{
                        $(this).html(hasChecked);
                    }
                });
                $(this).find('.status').html(select_img);
            }

            //获取当前点击的ssid
            var ssid = $(this).find('.wifi-name').text();
            updatedConfig_.basic.wifi.ssid = ssid;
            console.log("当前点击的ssid", updatedConfig_);





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
            $("#wired_mac_error").hide()
        }else {
            $("#wired_mac_error").text('未连接').show()
            $("#wired_mac").hide()
        }
        if(config.advanced.wired.ip){
            $('#wired_ip').val(config.advanced.wired.ip);
            $("#wired_ip_error").hide()
        }else {
            $("#wired_ip_error").text('未连接').show()
            $("#wired_ip").hide()
        }

    }

    // 点击重置按钮时，重新加载初始配置
    $('#basic-reset, #advanced-reset').click(function () {
        //确认弹窗
        if (confirm("是否要重置当前配置？")) {
            // updatedConfig_=initialConfig
            document.getElementById('myForm').reset();
            // 重置配置
            // initializeForm(updatedConfig_);
        }

    });
    $("#wifi_enabled").change(function () {
        console.log("wifi_enabled",$(this).prop('checked'))
        updatedConfig_.basic.wifi.enabled = $(this).prop('checked');
    })
    $("#distance_gauge_enabled").change(function () {
        console.log("distance_gauge_enabled",$(this).prop('checked'))
        updatedConfig_.advanced.distance_gauge.enabled = $(this).prop('checked');

    })
//download_Mp3
    $("#download_Mp3").click(function (event) {
        console.log("开始下载window.location.href")
        window.location.href='http://192.168.2.1/record/download'


    });
    //点击重启
    $('#restart').click(function () {
        var restart = confirm("确定重启设备吗？");
        if (restart) {

            $.ajax({
                url: base_url + "/restart",
                type: "POST",
                contentType: "application/json",
                success: function (response) {
                    if (response.result === 0) {
                        console.log("重启成功");
                        alert('重启成功')
                    } else {
                        alert('重启失败')
                        console.log("重启失败");
                    }
                },
                error: function (err) {
                    console.error("重启失败", err);
                    alert('重启失败',err)
                }
            });
        }
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
    $("#key-open").click(function () {
        //显示密码
        $("#wifi_password").attr("type", "text");
        $("#key-open").hide()
        $("#key-close").show()
    })
    $("#key-close").click(function () {
        //不显示密码
        $("#key-close").hide()
        $("#key-open").show()
        $("#wifi_password").attr("type", "password");

    })
    //distance_gauge_set 感应距离设置
    $("#distance_gauge_set").on('input', function (e) {
        if(e.delegateTarget.value>150||e.delegateTarget.value<20){
            if (e.delegateTarget.value!==""){
                // e.delegateTarget.value = "";
                $("#distance_gauge_set_error").show()
                updatedConfig_.advanced.distance_gauge.set = e.delegateTarget.value;
                console.log(updatedConfig_)
            }

        }else{
            $("#distance_gauge_set_error").hide()
            updatedConfig_.advanced.distance_gauge.set = e.delegateTarget.value;
            $("#distance_gauge_set_text").text(e.delegateTarget.value + "cm");
            console.log(updatedConfig_)
        }

    });
    //distance_gauge_time 感应时间
    $("#distance_gauge_time").on('input', function (e) {
        if(e.delegateTarget.value>60||e.delegateTarget.value<1){
            if(e.delegateTarget.value!==""){
                $("#distance_gauge_time_error").show()
                updatedConfig_.advanced.distance_gauge.time = e.delegateTarget.value;
                // e.delegateTarget.value = "";
            }

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
        console.log("初始配置", initialConfig);
        updatedConfig_.advanced.mic.staff_horizon = parseInt(angle);
    });
//staff_vertical职员方向垂直拾音角度
    $('#staff_vertical div').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active')
        var angle = $(this).find('span').text();
        // console.log(angle)
        console.log("当前点击的职员方向垂直拾音角度", updatedConfig_);
        console.log("初始配置", initialConfig);
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
    $('#basicForm').on('submit', function(event) {
        console.log(initialConfig)
        console.log(updatedConfig_)
        console.log("当前点击的ssid", updatedConfig_.basic.wifi.ssid);

        if(initialConfig.basic.wifi.enabled===true&&updatedConfig_.basic.wifi.enabled===false){
            //1.wifi开关从 开--->关， 可以提交配置，不需要校验是否选中wifi，输入密码
            event.preventDefault();
            submitForm()
        }
        else if(initialConfig.basic.wifi.enabled===false&&updatedConfig_.basic.wifi.enabled===true){
            // 2. wifi开关从 关-开 ， 可以提交配置，不需要校验是否选中wifi，输入密码
            event.preventDefault();
            submitForm()
        }
        else if(initialConfig.basic.wifi.enabled===true&&updatedConfig_.basic.wifi.enabled===true){
            //3. wifi开关状态不变【一直是开】，此时提交，需要判断是否选中wifi，是否输入密码
            if (updatedConfig_.basic.wifi.ssid && updatedConfig_.basic.wifi.password) {
                event.preventDefault();
                submitForm()
            } else {
                alert("请选择一个wifi并填写密码")
            }
        }
        //4. wifi开关状态不变【一直是关】，此时提交，需要弹框提示如“当前配置未修改”
        else if (initialConfig.basic.wifi.enabled===false&&updatedConfig_.basic.wifi.enabled===false){
            alert("当前配置未修改")
        }
        else{
            alert("当前配置未修改")
        }


    });
    // 点击高级配置提交按钮
    $('#myForm').on('submit', function(event) {
        console.log(updatedConfig_)
        //判断服务器域名、IP、端口如果非空时是否符合正则

       /* if (validateServerDetails(updatedConfig_.advanced.server.domain, updatedConfig_.advanced.server.ip, updatedConfig_.advanced.server.port)) {

            submitForm()
        } else {
            alert("请检查服务器域名、IP、端口是否正确")
        }*/
        if(updatedConfig_.advanced.distance_gauge.set>19&&updatedConfig_.advanced.distance_gauge.set<151&&updatedConfig_.advanced.distance_gauge.set!==""&&updatedConfig_.advanced.distance_gauge.set!==null&&updatedConfig_.advanced.distance_gauge.time>0&&updatedConfig_.advanced.distance_gauge.time<61&&updatedConfig_.advanced.distance_gauge.time!==""&&updatedConfig_.advanced.distance_gauge.time!==null){
            if (validateServerDetails( updatedConfig_.advanced.server.ip, updatedConfig_.advanced.server.port)) {
                event.preventDefault();
                submitForm()
            } else {
                alert("请检查服务器IP、端口是否正确")
            }
        }else{
            if(updatedConfig_.advanced.distance_gauge.set<20||updatedConfig_.advanced.distance_gauge.set>150){
                alert("“提交失败，感应距离超出限制范围，请重新配置")
            }
            if(updatedConfig_.advanced.distance_gauge.time<1||updatedConfig_.advanced.distance_gauge.time>60){
                alert("“提交失败，感应离开延迟时间超出限制范围，请重新配置")
            }
        }



    });
    function validateServerDetails( serverIP, serverPort) {
        var isValid = true;

       /* if (serverDomain) {
            isValid &= domainReg.test(serverDomain);
        }*/

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
        var defaultSsid=initialConfig.basic.wifi.ssids.filter(ssid=>ssid.status===true)
        if(defaultSsid.length>0){
            defaultSsid=defaultSsid[0].ssid
        }else{
            defaultSsid=null
        }
        console.log("wifi开关：",$('#wifi_enabled').is(':checked'))
        console.log("感应开关：",$('#distance_gauge_enabled').is(':checked'))

        var updatedConfig = {
            basic: {
                wifi: {
                    ssid: updatedConfig_.basic.wifi.ssid==null?defaultSsid!=undefined&&defaultSsid!=null?defaultSsid:"":updatedConfig_.basic.wifi.ssid,
                    password: updatedConfig_.basic.wifi.password || $('#wifi_password').val(),
                    enabled: $('#wifi_enabled').is(':checked'),
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
                    enabled: $('#distance_gauge_enabled').is(':checked')
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
        $.ajax({
            url: base_url + "/config",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(updatedConfig),
            success: function (response) {
                if (response.result === 0) {
                    alert("配置提交成功");
                    /*$.ajax({
                        url: base_url + "/restart",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(updatedConfig),
                        success: function (response) {
                            if (response.result === 0) {
                                console.log("重启成功");
                            } else {
                                console.log("重启失败");
                            }
                        },
                        error: function (err) {
                            console.error("重启失败", err);

                        }
                    });*/
                } else {
                    alert("配置提交失败");
                }
            },
            error: function (err) {
                console.error("配置提交失败", err);
                alert("配置提交失败");
            }
        });
    }

    // 设置麦克风角度函数
    function setMicAngles(micConfig) {
        console.log('设置麦克风角度',micConfig)
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






});
