const audio = document.getElementById('audio');
const playPauseButton = document.querySelector('.play-pause-button');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressBarCurrent = document.querySelector('.progress-bar-current');
const progressHandle = document.querySelector('.progress-handle');
const currentTimeDisplay = document.querySelector('.current-time');
const totalTimeDisplay = document.querySelector('.total-time');

let isPlaying = false;

function togglePlay() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
}

function updatePlayPauseButton() {
    if (isPlaying) {
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
    }
}

function updateProgress() {
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    const progressPercent = (currentTime / duration) * 100;
    progressBarCurrent.style.width = `${progressPercent}%`;
    progressHandle.style.left = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

audio.addEventListener('timeupdate', updateProgress);

playPauseButton.addEventListener('click', () => {
    togglePlay();
    isPlaying = !isPlaying;
    updatePlayPauseButton();
});

audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseButton();
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseButton();
});

audio.addEventListener('loadedmetadata', () => {
    totalTimeDisplay.textContent = formatTime(audio.duration);
});
