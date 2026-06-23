// Список всех звуков, которые у нас есть в папке assets
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
    'rain'
];

const soundsGrid = document.getElementById('soundsGrid');

// Объект, где мы будем хранить запущенные аудио-элементы
const activeAudios = {};

// Функция для перевода первой буквы в верхний регистр
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Генерация карточек
soundNames.forEach(name => {
    // 1. Создаем элемент карточки
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.dataset.sound = name;

    // 2. Создаем размытый фон (картинку)
    const bg = document.createElement('div');
    bg.className = 'sound-bg';
    // Путь к картинке в папке assets
    bg.style.backgroundImage = `url('assets/${name}.jpg')`;
    card.appendChild(bg);

    // 3. Создаем текст со свечением
    const title = document.createElement('span');
    title.className = 'sound-title';
    title.textContent = capitalizeFirstLetter(name);
    card.appendChild(title);

    // 4. Логика клика (включение/выключение звука)
    card.addEventListener('click', () => {
        toggleSound(name, card);
    });

    // Добавляем готовую карточку в сетку
    soundsGrid.appendChild(card);
});

// Функция управления звуком
function toggleSound(name, cardElement) {
    // Если этот звук уже создан и проигрывается
    if (activeAudios[name]) {
        // Останавливаем и удаляем
        activeAudios[name].pause();
        delete activeAudios[name];
        cardElement.classList.remove('active');
    } else {
        // Создаем новый аудио-объект
        const audio = new Audio(`assets/${name}.mp3`);
        audio.loop = true; // Зацикливаем воспроизведение
        audio.volume = 0.5; // Громкость по умолчанию (50%)
        
        audio.play()
            .then(() => {
                activeAudios[name] = audio;
                cardElement.classList.add('active');
            })
            .catch(err => {
                console.error(`Ошибка воспроизведения звука ${name}:`, err);
            });
    }
}