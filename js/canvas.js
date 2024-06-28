document.addEventListener('DOMContentLoaded', () => {
    const canvasLeft = document.getElementById('audio-visualizer-1');
    const canvasRight = document.getElementById('audio-visualizer-2');
    const canvasCtxLeft = canvasLeft.getContext('2d');
    const canvasCtxRight = canvasRight.getContext('2d');

    canvasLeft.width = canvasLeft.clientWidth;
    canvasLeft.height = canvasLeft.clientHeight;
    canvasRight.width = canvasRight.clientWidth;
    canvasRight.height = canvasRight.clientHeight;

    // 绘制默认波形图
    function drawDefaultWaveform() {
        canvasCtxLeft.fillStyle = 'rgb(240, 240, 240)';
        canvasCtxLeft.fillRect(0, 0, canvasLeft.width, canvasLeft.height);

        canvasCtxRight.fillStyle = 'rgb(240, 240, 240)';
        canvasCtxRight.fillRect(0, 0, canvasRight.width, canvasRight.height);

        canvasCtxLeft.lineWidth = 2;
        canvasCtxLeft.strokeStyle = '#32CD32'; // 绿色
        canvasCtxRight.lineWidth = 2;
        canvasCtxRight.strokeStyle = '#4169E1'; // 蓝色

        const bufferLength = 2048;
        const sliceWidth = canvasLeft.width * 1.0 / bufferLength;
        let x = 0;

        canvasCtxLeft.beginPath();
        canvasCtxRight.beginPath();

        for (let i = 0; i < bufferLength; i++) {
            const v = 0.5; // 默认值，绘制一个中间线
            const y = v * canvasLeft.height;

            if (i === 0) {
                canvasCtxLeft.moveTo(x, y);
                canvasCtxRight.moveTo(x, y);
            } else {
                canvasCtxLeft.lineTo(x, y);
                canvasCtxRight.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtxLeft.lineTo(canvasLeft.width, canvasLeft.height / 2);
        canvasCtxLeft.stroke();

        canvasCtxRight.lineTo(canvasRight.width, canvasRight.height / 2);
        canvasCtxRight.stroke();
    }

    drawDefaultWaveform();

    document.getElementById('button').addEventListener('click', function() {
        const audioUrl = 'https://app-1317281863.cos.ap-guangzhou.myqcloud.com/html/DJ%E6%95%8F%E5%B0%91-%E5%B7%A6%E5%8F%B3%E5%A3%B0%E9%81%93%E6%B5%8B%E8%AF%95.mp3';

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audio = new Audio(audioUrl);
        audio.crossOrigin = "anonymous";
        audio.load();

        const source = audioCtx.createMediaElementSource(audio);
        const splitter = audioCtx.createChannelSplitter(2);
        const analyserLeft = audioCtx.createAnalyser();
        const analyserRight = audioCtx.createAnalyser();

        analyserLeft.fftSize = 2048;
        analyserRight.fftSize = 2048;

        source.connect(splitter);
        splitter.connect(analyserLeft, 0);
        splitter.connect(analyserRight, 1);
        analyserLeft.connect(audioCtx.destination);
        analyserRight.connect(audioCtx.destination);

        const bufferLength = analyserLeft.fftSize;
        const dataArrayLeft = new Uint8Array(bufferLength);
        const dataArrayRight = new Uint8Array(bufferLength);

        audio.play();

        function draw() {
            requestAnimationFrame(draw);

            analyserLeft.getByteTimeDomainData(dataArrayLeft);
            analyserRight.getByteTimeDomainData(dataArrayRight);

            canvasCtxLeft.fillStyle = 'rgb(240, 240, 240)';
            canvasCtxLeft.fillRect(0, 0, canvasLeft.width, canvasLeft.height);

            canvasCtxRight.fillStyle = 'rgb(240, 240, 240)';
            canvasCtxRight.fillRect(0, 0, canvasRight.width, canvasRight.height);

            canvasCtxLeft.lineWidth = 2;
            canvasCtxLeft.strokeStyle = '#32CD32'; // 绿色
            canvasCtxRight.lineWidth = 2;
            canvasCtxRight.strokeStyle = '#4169E1'; // 蓝色

            canvasCtxLeft.beginPath();
            canvasCtxRight.beginPath();

            const sliceWidth = canvasLeft.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const vLeft = dataArrayLeft[i] / 128.0;
                const yLeft = vLeft * canvasLeft.height / 2;

                const vRight = dataArrayRight[i] / 128.0;
                const yRight = vRight * canvasRight.height / 2;

                if (i === 0) {
                    canvasCtxLeft.moveTo(x, yLeft);
                    canvasCtxRight.moveTo(x, yRight);
                } else {
                    canvasCtxLeft.lineTo(x, yLeft);
                    canvasCtxRight.lineTo(x, yRight);
                }

                x += sliceWidth;
            }

            canvasCtxLeft.lineTo(canvasLeft.width, canvasLeft.height / 2);
            canvasCtxLeft.stroke();

            canvasCtxRight.lineTo(canvasRight.width, canvasRight.height / 2);
            canvasCtxRight.stroke();
        }

        draw();
    });
});
