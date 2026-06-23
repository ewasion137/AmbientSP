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
    'rain window'
];

const soundsGrid = document.getElementById('soundsGrid');

// Подвязываем кастомные кнопки окна к Electron API
document.getElementById('btnMinimize').addEventListener('click', () => {
    window.electronAPI.minimize();
});

document.getElementById('btnTray').addEventListener('click', () => {
    window.electronAPI.hideToTray();
});

document.getElementById('btnClose').addEventListener('click', () => {
    window.electronAPI.close();
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
    title.textContent = capitalizeFirstLetter(name);
    card.appendChild(title);

    // Создаем контейнер для слайдера громкости
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'volume-container';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'volume-slider';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = '0.5'; // Громкость по умолчанию 50%

    volumeContainer.appendChild(slider);
    card.appendChild(volumeContainer);

    // Ссылка на объект аудио для этой конкретной карточки
    let audio = null;

    // Регулировка громкости слайдером
    slider.addEventListener('input', (e) => {
        if (audio) {
            audio.volume = e.target.value;
        }
    });

    // Важно: останавливаем всплытие клика!
    // Без этого клик по слайдеру будет выключать/включать всю карточку.
    slider.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Логика клика по карточке (вкл/выкл звука)
    card.addEventListener('click', () => {
        if (audio) {
            // Если звук играет — выключаем его
            audio.pause();
            audio = null;
            card.classList.remove('active');
        } else {
            // Если звук выключен — создаем и запускаем
            audio = new Audio(`assets/${name}.mp3`);
            audio.loop = true;
            audio.volume = slider.value; // Устанавливаем громкость со слайдера
            
            audio.play()
                .then(() => {
                    card.classList.add('active');
                })
                .catch(err => {
                    console.error(`Ошибка воспроизведения ${name}:`, err);
                });
        }
    });

    soundsGrid.appendChild(card);
});