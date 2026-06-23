// Полный обновленный список твоих 18 звуков
const soundNames = [
    'river',
    'stream',
    'thunderstorm',
    'wind',
    'chatter',
    'cricket',
    'fire',
    'forest',
    'ocean',
    'rain',
    'rain in car',
    'rain window',
    'train',
    'highway',
    'keyboard',
    'white noise',
    'brown noise',
    'pink noise'
];

const soundsGrid = document.getElementById('soundsGrid');

// Объект, хранящий информацию о карточках и аудио
const cardsMap = {};

// Подключение системных кнопок окна
document.getElementById('btnMinimize').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('btnTray').addEventListener('click', () => window.electronAPI.hideToTray());
document.getElementById('btnClose').addEventListener('click', () => window.electronAPI.close());
document.getElementById('btnReset').addEventListener('click', () => {
    resetAllSounds();
});

// Функция полного сброса
function resetAllSounds() {
    soundNames.forEach(name => {
        const cardData = cardsMap[name];
        if (cardData) {
            // Останавливаем аудио, если оно играло
            if (cardData.audio) {
                cardData.audio.pause();
                cardData.audio = null;
            }
            // Сбрасываем статус активности карточки в коде и визуально
            cardData.active = false;
            cardData.cardElement.classList.remove('active');
            
            // Возвращаем слайдер громкости на дефолтные 50%
            cardData.slider.value = 0.5;
        }
    });
    
    // Полностью удаляем файл сохранения из памяти
    localStorage.removeItem('ambientSP_save');
}


// Слушаем сигнал из трея "Mute All Sounds"
window.electronAPI.onMuteAll(() => {
    muteAllSounds();
});

// Умная капитализация: "rain in car" -> "Rain In Car"
function capitalizeWords(string) {
    return string.split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');
}

// Сохранение состояния в LocalStorage
function saveCurrentState() {
    const state = {};
    soundNames.forEach(name => {
        const cardData = cardsMap[name];
        if (cardData) {
            state[name] = {
                active: cardData.active,
                volume: cardData.slider.value
            };
        }
    });
    localStorage.setItem('ambientSP_save', JSON.stringify(state));
}

// Загрузка состояния при старте
function loadSavedState() {
    const saved = localStorage.getItem('ambientSP_save');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        soundNames.forEach(name => {
            if (state[name] && cardsMap[name]) {
                const cardData = cardsMap[name];
                cardData.slider.value = state[name].volume;
                if (state[name].active) {
                    toggleSound(name, true);
                }
            }
        });
    } catch (e) {
        console.error('Error loading saved state:', e);
    }
}

// Выключить все звуки
function muteAllSounds() {
    soundNames.forEach(name => {
        const cardData = cardsMap[name];
        if (cardData && cardData.active) {
            toggleSound(name, false);
        }
    });
    saveCurrentState();
}

// Генерация карточек
soundNames.forEach(name => {
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.dataset.sound = name;

    const bg = document.createElement('div');
    bg.className = 'sound-bg';
    bg.style.backgroundImage = `url('assets/${name}.jpg')`;
    card.appendChild(bg);

    const title = document.createElement('span');
    title.className = 'sound-title';
    title.textContent = capitalizeWords(name);
    card.appendChild(title);

    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'volume-container';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'volume-slider';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = '0.5';

    volumeContainer.appendChild(slider);
    card.appendChild(volumeContainer);

    // Добавляем карточку в наш реестр
    cardsMap[name] = {
        cardElement: card,
        slider: slider,
        audio: null,
        active: false
    };

    // Изменение громкости ползунком
    slider.addEventListener('input', (e) => {
        const volume = e.target.value;
        const cardData = cardsMap[name];
        if (cardData && cardData.audio) {
            cardData.audio.volume = volume;
        }
        saveCurrentState();
    });

    slider.addEventListener('click', (e) => e.stopPropagation());

    // Клик по карточке (вкл/выкл)
    card.addEventListener('click', () => {
        const cardData = cardsMap[name];
        if (cardData) {
            toggleSound(name, !cardData.active);
            saveCurrentState();
        }
    });

    soundsGrid.appendChild(card);
});

// Функция включения/выключения звука
function toggleSound(name, forceState) {
    const cardData = cardsMap[name];
    if (!cardData) return;
    
    if (forceState === true) {
        if (!cardData.audio) {
            cardData.audio = new Audio(`assets/${name}.mp3`);
            cardData.audio.loop = true;
            cardData.audio.volume = cardData.slider.value;
            cardData.audio.play()
                .then(() => {
                    cardData.active = true;
                    cardData.cardElement.classList.add('active');
                })
                .catch(err => console.error(`Error playing sound ${name}:`, err));
        }
    } else {
        if (cardData.audio) {
            cardData.audio.pause();
            cardData.audio = null;
            cardData.active = false;
            cardData.cardElement.classList.remove('active');
        }
    }
}

// Запуск восстановления сохраненного состояния
loadSavedState();