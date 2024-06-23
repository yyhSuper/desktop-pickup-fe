let timerInterval;
let seconds = 0;
let audioCtx;
let analyserLeft, analyserRight;
let dataArrayLeft, dataArrayRight;
let bufferLength;
let source;
let animationId;
let loadedData = [];
const canvas1 = document.getElementById('audio-visualizer-1');
const canvas2 = document.getElementById('audio-visualizer-2');
const canvasCtx1 = canvas1.getContext('2d');
const canvasCtx2 = canvas2.getContext('2d');
let bufferAccumulator = [];
const bufferAccumulationLimit = 1000;
let accumulationTimer;
let reader;
let controller;

$('#start').click(function() {
    $(this).hide();
    $('#stop').show();
    $('#record-time').show();
    startRecording();
});

$('#stop').click(function() {
    $(this).hide();
    $('#start').show();
    $('#record-time').hide();
    stopRecording();
});

function initAudioContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext 初始化成功');
        } catch (e) {
            console.error('无法创建 AudioContext:', e);
        }
    }
}

initAudioContext();

function startTimer() {
    seconds = 0;
    updateTimerDisplay(seconds);
    clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        seconds++;
        updateTimerDisplay(seconds);
    }, 1000);
    console.log('计时器开始');
}

function stopTimer() {
    clearInterval(timerInterval);
    console.log('计时器停止');
}

function updateTimerDisplay(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    $('#record-time-text').text(formattedTime);
}

async function startRecording() {
    $('#error').text('');
    stopRecording();

    initAudioContext();

    analyserLeft = audioCtx.createAnalyser();
    analyserRight = audioCtx.createAnalyser();
    analyserLeft.fftSize = 2048;
    analyserRight.fftSize = 2048;
    bufferLength = analyserLeft.frequencyBinCount;
    dataArrayLeft = new Uint8Array(bufferLength);
    dataArrayRight = new Uint8Array(bufferLength);
    controller = new AbortController();
    try {
        const response = await fetch('http://192.168.2.1/record/stream', {
            method: 'GET',
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error('HTTP 请求失败: ' + response.statusText);
        }
        reader = response.body.getReader();

        startTimer();

        reader.read().then(processResult).catch(error => {
            if (error.name === 'AbortError') {
                console.log('读取被用户手动停止');
            } else {
                console.error('读取音频数据错误详细:', error);
            }
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('请求被用户手动停止');
        } else {
            console.error('音频请求错误', error);
        }
    }
}

async function processResult(result) {
    if (result.done) {
        console.log('读取完成');
        stopRecording();
        return;
    }

    console.log('接收到数据块:', result.value);
    loadedData.push(result.value);

    bufferAccumulator.push(result.value);
    if (bufferAccumulator.length >= bufferAccumulationLimit) {
        await flushAccumulatedData();
    } else if (!accumulationTimer) {
        accumulationTimer = setTimeout(async () => {
            await flushAccumulatedData();
            accumulationTimer = null;
        }, 100);
    }

    reader.read().then(processResult);
}

async function flushAccumulatedData() {
    if (bufferAccumulator.length === 0) return;

    const concatenatedBuffer = concatenateArrayBuffers(bufferAccumulator);
    bufferAccumulator = [];

    const audioBlob = new Blob([concatenatedBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    try {
        const decodedAudioData = await decodeAndPlay(audioUrl);
        if (decodedAudioData) {
            updateVisualizers(decodedAudioData);
        }
        URL.revokeObjectURL(audioUrl);
    } catch (error) {
        console.error('解码播放累积数据错误:', error);
    }
}

function setupAudioProcessing() {
    analyserLeft = audioCtx.createAnalyser();
    analyserRight = audioCtx.createAnalyser();
    analyserLeft.fftSize = 2048;
    analyserRight.fftSize = 2048;
    bufferLength = analyserLeft.frequencyBinCount;
    dataArrayLeft = new Uint8Array(bufferLength);
    dataArrayRight = new Uint8Array(bufferLength);
}

async function decodeAndPlay(audioUrl) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudioData = await audioCtx.decodeAudioData(arrayBuffer);
    if (decodedAudioData) {
        const source = audioCtx.createBufferSource();
        source.buffer = decodedAudioData;
        const splitter = audioCtx.createChannelSplitter(2);
        source.connect(splitter);
        splitter.connect(analyserLeft, 0);
        splitter.connect(analyserRight, 1);
        source.connect(audioCtx.destination);
        source.start(0);
        source.onended = () => {
            source.disconnect();
        };
        return decodedAudioData;
    }
    return null;
}

function updateVisualizers(decodedAudioData) {
    if (!decodedAudioData) return;
    draw();
}

function stopRecording() {
    console.log('停止录音');
    if (controller) {
        controller.abort();
    }
    if (source) {
        source.stop();
        source.disconnect();
        console.log('音频源已停止');
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    stopTimer();
    cleanupAudioNodes();
}

function cleanupAudioNodes() {
    if (source) {
        source.disconnect();
        source = null;
    }
    if (analyserLeft) {
        analyserLeft.disconnect();
        analyserLeft = null;
    }
    if (analyserRight) {
        analyserRight.disconnect();
        analyserRight = null;
    }
}

function concatenateArrayBuffers(buffers) {
    let totalLength = buffers.reduce((acc, value) => acc + value.byteLength, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let buffer of buffers) {
        result.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }
    return result.buffer;
}

function draw() {
    if (!analyserLeft || !analyserRight) return;
    animationId = requestAnimationFrame(draw);
    analyserLeft.getByteTimeDomainData(dataArrayLeft);
    analyserRight.getByteTimeDomainData(dataArrayRight);
    drawWave(canvasCtx1, dataArrayLeft);
    drawWave(canvasCtx2, dataArrayRight);
}

function drawWave(ctx, data) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const middle = height / 2;
    const sliceWidth = width / bufferLength;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        let v = data[i] / 128.0;
        let y = v * middle;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctx.lineTo(ctx.canvas.width, middle);
    ctx.stroke();
}

// 减缓波形图更新速度的函数
function slowDownDraw() {
    if (!analyserLeft || !analyserRight) return;
    animationId = setTimeout(() => {
        draw();
        slowDownDraw();
    }, 100); // 100ms 间隔
}

slowDownDraw();
