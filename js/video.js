let timerInterval; // 定义一个变量来存储计时器间隔
let seconds = 0; // 定义一个变量来存储秒数
let audioCtx; // 定义一个变量来存储音频上下文
let analyserLeft, analyserRight; // 定义变量来存储左右声道的分析器
let dataArrayLeft, dataArrayRight; // 定义变量来存储左右声道的数据数组
let bufferLength; // 定义变量来存储缓冲区长度
let source; // 定义变量来存储音频源
let animationId; // 定义变量来存储动画帧 ID
let loadedData = []; // 定义一个数组来存储加载的数据
const canvas1 = document.getElementById('audio-visualizer-1'); // 获取第一个画布元素
const canvas2 = document.getElementById('audio-visualizer-2'); // 获取第二个画布元素
const canvasCtx1 = canvas1.getContext('2d'); // 获取第一个画布的 2D 上下文
const canvasCtx2 = canvas2.getContext('2d'); // 获取第二个画布的 2D 上下文
let bufferAccumulator = []; // 定义一个数组来累积缓冲数据
const bufferAccumulationLimit = 1000; // 定义缓冲累积的限制
let accumulationTimer; // 定义一个变量来存储累积计时器
let reader; // 定义一个变量来存储读取器
let controller; // 定义一个变量来存储控制器

// 点击开始按钮的事件处理函数
$('#start').click(function() {
    $(this).hide(); // 隐藏开始按钮
    $('#stop').show(); // 显示停止按钮
    $('#record-time').show(); // 显示记录时间
    startRecording(); // 开始录音
});

// 点击停止按钮的事件处理函数
$('#stop').click(function() {
    $(this).hide(); // 隐藏停止按钮
    $('#start').show(); // 显示开始按钮
    $('#record-time').hide(); // 隐藏记录时间
    stopRecording(); // 停止录音
});

// 初始化音频上下文的函数
function initAudioContext() {
    if (!audioCtx) { // 如果音频上下文未初始化
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // 创建音频上下文
            console.log('AudioContext 初始化成功'); // 打印初始化成功信息
        } catch (e) {
            console.error('无法创建 AudioContext:', e); // 打印初始化失败信息
        }
    }
}

initAudioContext(); // 调用初始化音频上下文函数

// 开始计时器的函数
function startTimer() {
    seconds = 0; // 重置秒数
    updateTimerDisplay(seconds); // 更新计时器显示
    clearInterval(timerInterval); // 清除已有的计时器
    timerInterval = setInterval(function() {
        seconds++; // 每秒增加秒数
        updateTimerDisplay(seconds); // 更新计时器显示
    }, 1000); // 每 1000 毫秒执行一次
    console.log('计时器开始'); // 打印计时器开始信息
}

// 停止计时器的函数
function stopTimer() {
    clearInterval(timerInterval); // 清除计时器
    console.log('计时器停止'); // 打印计时器停止信息
}

// 更新计时器显示的函数
function updateTimerDisplay(seconds) {
    let minutes = Math.floor(seconds / 60); // 计算分钟数
    let remainingSeconds = seconds % 60; // 计算剩余的秒数
    let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds; // 格式化时间
    $('#record-time-text').text(formattedTime); // 更新显示的时间
}

// 开始录音的函数
async function startRecording() {
    $('#error').text(''); // 清空错误信息
    stopRecording(); // 停止已有的录音

    initAudioContext(); // 初始化音频上下文

    analyserLeft = audioCtx.createAnalyser(); // 创建左声道分析器
    analyserRight = audioCtx.createAnalyser(); // 创建右声道分析器
    analyserLeft.fftSize = 2048; // 设置左声道分析器的 FFT 大小
    analyserRight.fftSize = 2048; // 设置右声道分析器的 FFT 大小
    bufferLength = analyserLeft.frequencyBinCount; // 获取缓冲区长度
    dataArrayLeft = new Uint8Array(bufferLength); // 初始化左声道数据数组
    dataArrayRight = new Uint8Array(bufferLength); // 初始化右声道数据数组
    controller = new AbortController(); // 创建控制器
    try {
        const response = await fetch('http://192.168.2.1/record/stream', {
            method: 'GET',
            signal: controller.signal // 设置请求的控制信号
        });
        if (!response.ok) {
            throw new Error('HTTP 请求失败: ' + response.statusText); // 抛出 HTTP 请求失败的错误
        }
        reader = response.body.getReader(); // 获取响应的读取器

        startTimer(); // 开始计时器

        reader.read().then(processResult).catch(error => {
            if (error.name === 'AbortError') {
                console.log('读取被用户手动停止'); // 打印读取被用户停止的信息
            } else {
                console.error('读取音频数据错误详细:', error); // 打印读取音频数据错误的详细信息
            }
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('请求被用户手动停止'); // 打印请求被用户停止的信息
        } else {
            console.error('音频请求错误', error); // 打印音频请求错误的信息
        }
    }
}

// 处理结果的函数
async function processResult(result) {
    if (result.done) {
        console.log('读取完成'); // 打印读取完成的信息
        stopRecording(); // 停止录音
        return;
    }

    console.log('接收到数据块:', result.value); // 打印接收到的数据块
    loadedData.push(result.value); // 将数据块存入已加载数据数组

    bufferAccumulator.push(result.value); // 将数据块存入缓冲累积器
    if (bufferAccumulator.length >= bufferAccumulationLimit) {
        await flushAccumulatedData(); // 如果缓冲累积器达到限制，刷新累积数据
    } else if (!accumulationTimer) {
        accumulationTimer = setTimeout(async () => {
            await flushAccumulatedData(); // 设置累积计时器
            accumulationTimer = null; // 重置累积计时器
        }, 100);
    }

    reader.read().then(processResult); // 继续读取数据
}

// 刷新累积数据的函数
async function flushAccumulatedData() {
    if (bufferAccumulator.length === 0) return;

    const concatenatedBuffer = concatenateArrayBuffers(bufferAccumulator); // 拼接累积的缓冲区
    bufferAccumulator = []; // 清空缓冲累积器

    const audioBlob = new Blob([concatenatedBuffer], { type: 'audio/mpeg' }); // 创建音频 Blob 对象
    const audioUrl = URL.createObjectURL(audioBlob); // 创建音频 URL

    try {
        const decodedAudioData = await decodeAndPlay(audioUrl); // 解码并播放音频
        if (decodedAudioData) {
            updateVisualizers(decodedAudioData); // 更新可视化器
        }
        URL.revokeObjectURL(audioUrl); // 撤销音频 URL
    } catch (error) {
        console.error('解码播放累积数据错误:', error); // 打印解码播放累积数据的错误信息
    }
}

// 设置音频处理的函数
function setupAudioProcessing() {
    analyserLeft = audioCtx.createAnalyser(); // 创建左声道分析器
    analyserRight = audioCtx.createAnalyser(); // 创建右声道分析器
    analyserLeft.fftSize = 2048; // 设置左声道分析器的 FFT 大小
    analyserRight.fftSize = 2048; // 设置右声道分析器的 FFT 大小
    bufferLength = analyserLeft.frequencyBinCount; // 获取缓冲区长度
    dataArrayLeft = new Uint8Array(bufferLength); // 初始化左声道数据数组
    dataArrayRight = new Uint8Array(bufferLength); // 初始化右声道数据数组
}

// 解码并播放音频的函数
async function decodeAndPlay(audioUrl) {
    const response = await fetch(audioUrl); // 获取音频 URL 的响应
    const arrayBuffer = await response.arrayBuffer(); // 获取响应的数组缓冲区
    const decodedAudioData = await audioCtx.decodeAudioData(arrayBuffer); // 解码音频数据
    if (decodedAudioData) {
        const source = audioCtx.createBufferSource(); // 创建音频源
        source.buffer = decodedAudioData; // 设置音频源的缓冲区
        const splitter = audioCtx.createChannelSplitter(2); // 创建通道分离器
        source.connect(splitter); // 连接音频源到分离器
        splitter.connect(analyserLeft, 0); // 连接分离器的左通道到左声道分析器
        splitter.connect(analyserRight, 1); // 连接分离器的右通道到右声道分析器
        source.connect(audioCtx.destination); // 连接音频源到音频上下文的目标
        source.start(0); // 启动音频源
        source.onended = () => {
            source.disconnect(); // 当音频源结束时断开连接
        };
        return decodedAudioData; // 返回解码的音频数据
    }
    return null; // 返回空值
}

// 更新可视化器的函数
function updateVisualizers(decodedAudioData) {
    if (!decodedAudioData) return;
    draw(); // 调用绘制函数
}

// 停止录音的函数
function stopRecording() {
    console.log('停止录音'); // 打印停止录音的信息
    if (controller) {
        controller.abort(); // 终止控制器
    }
    if (source) {
        source.stop(); // 停止音频源
        source.disconnect(); // 断开音频源
        console.log('音频源已停止'); // 打印音频源停止的信息
    }
    if (animationId) {
        cancelAnimationFrame(animationId); // 取消动画帧
    }
    stopTimer(); // 停止计时器
    cleanupAudioNodes(); // 清理音频节点
}

// 清理音频节点的函数
function cleanupAudioNodes() {
    if (source) {
        source.disconnect(); // 断开音频源
        source = null; // 清空音频源
    }
    if (analyserLeft) {
        analyserLeft.disconnect(); // 断开左声道分析器
        analyserLeft = null; // 清空左声道分析器
    }
    if (analyserRight) {
        analyserRight.disconnect(); // 断开右声道分析器
        analyserRight = null; // 清空右声道分析器
    }
}

// 拼接数组缓冲区的函数
function concatenateArrayBuffers(buffers) {
    let totalLength = buffers.reduce((acc, value) => acc + value.byteLength, 0); // 计算总长度
    let result = new Uint8Array(totalLength); // 创建结果数组
    let offset = 0; // 初始化偏移量
    for (let buffer of buffers) {
        result.set(new Uint8Array(buffer), offset); // 设置结果数组
        offset += buffer.byteLength; // 增加偏移量
    }
    return result.buffer; // 返回拼接后的缓冲区
}

// 绘制函数
function draw() {
    if (!analyserLeft || !analyserRight) return;
    animationId = requestAnimationFrame(draw); // 请求动画帧
    analyserLeft.getByteTimeDomainData(dataArrayLeft); // 获取左声道数据
    analyserRight.getByteTimeDomainData(dataArrayRight); // 获取右声道数据
    drawWave(canvasCtx1, dataArrayLeft); // 绘制左声道波形图
    drawWave(canvasCtx2, dataArrayRight); // 绘制右声道波形图
}

// 绘制波形图的函数
function drawWave(ctx, data) {
    const width = ctx.canvas.width; // 获取画布宽度
    const height = ctx.canvas.height; // 获取画布高度
    const middle = height / 2; // 计算中间位置
    const sliceWidth = width / bufferLength; // 计算每段的宽度
    ctx.clearRect(0, 0, width, height); // 清除画布
    ctx.lineWidth = 2; // 设置线条宽度
    ctx.strokeStyle = 'green'; // 设置线条颜色
    ctx.beginPath(); // 开始路径
    let x = 0; // 初始化 x 坐标
    for (let i = 0; i < bufferLength; i++) {
        let v = data[i] / 128.0; // 计算数据值
        let y = v * middle; // 计算 y 坐标
        if (i === 0) {
            ctx.moveTo(x, y); // 移动画笔到起点
        } else {
            ctx.lineTo(x, y); // 画线到当前点
        }
        x += sliceWidth; // 增加 x 坐标
    }
    ctx.lineTo(ctx.canvas.width, middle); // 画线到画布右边
    ctx.stroke(); // 绘制路径
}

// 减缓波形图更新速度的函数
function slowDownDraw() {
    if (!analyserLeft || !analyserRight) return;
    animationId = setTimeout(() => {
        draw(); // 调用绘制函数
        slowDownDraw(); // 递归调用减缓函数
    }, 100); // 300 毫秒间隔
}

slowDownDraw(); // 调用减缓函数
