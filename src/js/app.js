// Просто добавляй новые названия звуков сюда! 
// Главное, чтобы в assets лежали файлы {имя}.mp3 и {имя}.jpg
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
const dynamicBg = document.getElementById('dynamicBg');

// Объект, хранящий информацию о карточках и аудио
const cardsMap = {};

// Подключение системных кнопок окна
document.getElementById('btnMinimize').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('btnTray').addEventListener('click', () => window.electronAPI.hideToTray());
document.getElementById('btnClose').addEventListener('click', () => window.electronAPI.close());

// Слушаем сигнал из трея "Выключить все звуки"
window.electronAPI.onMuteAll(() => {
    muteAllSounds();
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Умный расчет инвертированного цвета картинки через скрытый Canvas
function getInvertedColor(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 1, 1);
            
            // Получаем средний цвет картинки
            const imgData = ctx.getImageData(0, 0, 1, 1).data;
            const r = imgData[0];
            const g = imgData[1];
            const b = imgData[2];

            // Рассчитываем инвертированный цвет
            const invR = 255 - r;
            const invG = 255 - g;
            const invB = 255 - b;

            resolve(`rgb(${invR}, ${invG}, ${invB})`);
        };
        img.onerror = () => {
            // Дефолтный бирюзовый цвет, если картинка не загрузилась
            resolve('rgb(0, 255, 204)');
        };
    });
}

// Сохранение состояния в LocalStorage
function saveCurrentState() {
    const state = {};
    soundNames.forEach(name => {
        const cardData = cardsMap[name];
        state[name] = {
            active: cardData.active,
            volume: cardData.slider.value
        };
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
            if (state[name]) {
                const cardData = cardsMap[name];
                cardData.slider.value = state[name].volume;
                if (state[name].active) {
                    toggleSound(name, true); // включаем сохраненный звук
                }
            }
        });
    } catch (e) {
        console.error('Ошибка загрузки сохранения:', e);
    }
}

// Выключить абсолютно все звуки
function muteAllSounds() {
    soundNames.forEach(name => {
        const cardData = cardsMap[name];
        if (cardData.active) {
            toggleSound(name, false);
        }
    });
    saveCurrentState();
}

// Обновление разделенного анимированного фона
function updateDynamicBackground() {
    // Получаем список только активных звуков
    const activeSounds = soundNames.filter(name => cardsMap[name].active);
    
    // Очищаем фоновый контейнер
    dynamicBg.innerHTML = '';

    // Заполняем его анимированными срезами
    activeSounds.forEach(name => {
        const slice = document.createElement('div');
        slice.className = 'bg-slice';
        slice.style.backgroundImage = `url('assets/${name}.jpg')`;
        dynamicBg.appendChild(slice);
    });
}

// Генерация карточек
soundNames.forEach(name => {
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.dataset.sound = name;

    const bg = document.createElement('div');
    bg.className = 'sound-bg';
    const bgPath = `assets/${name}.jpg`;
    bg.style.backgroundImage = `url('${bgPath}')`;
    card.appendChild(bg);

    // Рассчитываем инвертированный цвет и вешаем его на карточку в CSS переменные
    getInvertedColor(bgPath).then(color => {
        card.style.setProperty('--active-color', color);
    });

    const title = document.createElement('span');
    title.className = 'sound-title';
    title.textContent = capitalizeFirstLetter(name);
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

    // Инициализируем данные карточки в карту
    cardsMap[name] = {
        cardElement: card,
        slider: slider,
        audio: null,
        active: false
    };

    // Событие слайдера громкости
    slider.addEventListener('input', (e) => {
        const volume = e.target.value;
        const cardData = cardsMap[name];
        if (cardData.audio) {
            cardData.audio.volume = volume;
        }
        saveCurrentState();
    });

    slider.addEventListener('click', (e) => e.stopPropagation());

    // Событие клика по карточке
    card.addEventListener('click', () => {
        const cardData = cardsMap[name];
        toggleSound(name, !cardData.active);
        saveCurrentState();
    });

    soundsGrid.appendChild(card);
});

// Функция включения/выключения конкретного звука
function toggleSound(name, forceState) {
    const cardData = cardsMap[name];
    
    if (forceState === true) {
        // Включаем
        if (!cardData.audio) {
            cardData.audio = new Audio(`assets/${name}.mp3`);
            cardData.audio.loop = true;
            cardData.audio.volume = cardData.slider.value;
            cardData.audio.play()
                .then(() => {
                    cardData.active = true;
                    cardData.cardElement.classList.add('active');
                    updateDynamicBackground();
                })
                .catch(err => console.error(`Ошибка запуска звука ${name}:`, err));
        }
    } else {
        // Выключаем
        if (cardData.audio) {
            cardData.audio.pause();
            cardData.audio = null;
            cardData.active = false;
            cardData.cardElement.classList.remove('active');
            updateDynamicBackground();
        }
    }
}

// Запускаем восстановление сохраненного состояния после рендера карточек
loadSavedState();