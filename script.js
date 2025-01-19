// Função para efeito partituras 
document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background-effect');
    const symbols = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞', '𝄢', '𝄡', '♮', '♯']; // Símbolos musicais

    function createSymbol() {
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.left = `${Math.random() * 100}%`; // Posição horizontal aleatória
        symbol.style.fontSize = `${Math.random() * 20 + 20}px`; // Tamanho aleatório
        symbol.style.animationDuration = `${Math.random() * 5 + 5}s`; // Duração aleatória
        background.appendChild(symbol);

        // Remove o símbolo após a animação
        setTimeout(() => {
            symbol.remove();
        }, 10000); // Deve ser igual à duração máxima da animação
    }

    // Gera novos símbolos a cada 300ms
    setInterval(createSymbol, 300);
});

// Variável para armazenar os dados do clima
let currentWeatherData = null;

// Função para obter localização do usuário
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("Localização obtida:", { latitude, longitude });
                callback(latitude, longitude);
            },
            (error) => {
                console.error("Erro ao obter localização:", error.message);
                alert("Não foi possível obter sua localização.");
            }
        );
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }
}

// Função para obter informações do clima do OpenWeatherMap
function getWeather(latitude, longitude, callback) {
    const apiKey = "5bf2b65c5212135fb230d1432dd6bb3b"; // Substitua pela sua chave do OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro na API de clima: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const temperature = Math.round(data.main.temp);
            const humidity = data.main.humidity;
            const weatherDescription = data.weather[0].description;
            const city = data.name;

            console.log("Dados de clima obtidos:", { temperature, humidity, weatherDescription, city });

            callback({ temperature, humidity, weatherDescription, city });
        })
        .catch((error) => {
            console.error("Erro ao buscar clima:", error);
            alert("Não foi possível obter informações do clima.");
        });
}

// Função para atualizar o relógio
function updateClock() {
    const clockElement = document.getElementById("digital-clock");

    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
    }));

    const weekDays = [
        "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
        "Quinta-feira", "Sexta-feira", "Sábado"
    ];

    const day = brasiliaTime.getDate().toString().padStart(2, "0");
    const month = (brasiliaTime.getMonth() + 1).toString().padStart(2, "0");
    const year = brasiliaTime.getFullYear();
    const hours = brasiliaTime.getHours().toString().padStart(2, "0");
    const minutes = brasiliaTime.getMinutes().toString().padStart(2, "0");
    const seconds = brasiliaTime.getSeconds().toString().padStart(2, "0");
    const weekDayName = weekDays[brasiliaTime.getDay()];

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const formattedDate = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Verifica se há dados de clima
    let weatherInfo = "";
    if (currentWeatherData) {
        const { temperature, humidity, weatherDescription, city } = currentWeatherData;
        weatherInfo = `<br>${city} - ${temperature}°C, ${weatherDescription}, Umidade: ${humidity}%`;
    }

    // Atualiza o elemento HTML com a data, hora e clima
    clockElement.innerHTML = `${formattedTime} - ${weekDayName}, ${formattedDate}${weatherInfo}`;
}

// Função para atualizar automaticamente as informações do clima
function updateWeatherAutomatically(latitude, longitude) {
    function fetchWeather() {
        getWeather(latitude, longitude, (weatherData) => {
            currentWeatherData = weatherData; // Armazena os dados do clima
        });
    }

    fetchWeather(); // Atualiza o clima imediatamente ao carregar
    setInterval(fetchWeather, 300000); // Atualiza o clima a cada 5 minutos
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    // Atualiza o relógio a cada segundo
    setInterval(updateClock, 1000);

    // Atualiza o clima periodicamente
    getUserLocation((latitude, longitude) => {
        updateWeatherAutomatically(latitude, longitude);
    });
});

let currentIndex = 0; // Índice da música atual
let shuffleMode = false; // Modo aleatório desativado por padrão
let currentPlaylist = []; // Playlist atualmente em uso
let availablePlaylists = {}; // Objeto para armazenar as playlists
let combinedPlaylist = []; // Playlist combinada de todas as playlists

const player = document.getElementById('player');
const albumCover = document.getElementById('current-album');
const shuffleButton = document.getElementById('shuffle');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const effectContainer = document.getElementById('effect-container');
const title = document.getElementById('music-title');
const artist = document.getElementById('music-artist');
const btnPlaylist1 = document.getElementById('btn-playlist1');
const btnPlaylist2 = document.getElementById('btn-playlist2');
const btnCombined = document.getElementById('btn-combined');

// Modal para exibição da letra
const lyricsModal = document.getElementById('lyrics-modal');
const closeLyricsButton = document.getElementById('close-lyrics');
const lyricsTitle = document.getElementById('lyrics-title');
const lyricsContent = document.getElementById('lyrics-content');

// Variável para armazenar o botão "Visualizar Letra"
const lyricsButton = document.createElement("button");
lyricsButton.id = "view-lyrics";
lyricsButton.innerText = "Visualizar Letra";
lyricsButton.style.display = "none"; // Oculta o botão inicialmente
document.getElementById('music-details').appendChild(lyricsButton);

// Função para carregar playlists do HTML
function loadPlaylists() {
  const playlistElements = document.querySelectorAll('ul[id^="playlist"]'); // Seleciona todas as playlists
  playlistElements.forEach(playlistElement => {
    const playlistId = playlistElement.id; // ID da playlist
    const playlistItems = playlistElement.querySelectorAll('li');
    const playlist = Array.from(playlistItems).map(item => ({
      file: item.getAttribute('data-file'),
      cover: item.getAttribute('data-cover') || 'images/default-cover.jpg',
      title: item.getAttribute('data-title'),
      artist: item.getAttribute('data-artist') || 'Artista Desconhecido'
    }));
    availablePlaylists[playlistId] = playlist; // Armazena a playlist no objeto
    combinedPlaylist = combinedPlaylist.concat(playlist); // Adiciona as músicas à playlist combinada
  });
}

// Função para carregar o JSON de letras
async function fetchLyrics() {
  const response = await fetch("lyrics.json"); // Caminho do JSON
  const data = await response.json();
  return data;
}

// Função para exibir a letra da música
async function showLyrics(songTitle) {
  const lyricsData = await fetchLyrics();

  if (lyricsData[songTitle]) {
    const { artist, lyrics, language } = lyricsData[songTitle];

    // Formatar as letras com base no idioma e respeitar \n\n
    const formattedLyrics = lyrics
      .split("\n\n") // Divide estrofes por \n\n
      .map((strophe) =>
        strophe
          .split("\n") // Divide as linhas dentro de cada estrofe
          .map((line, index) =>
            index % 2 === 0
              ? `<span class="${language}">${line}</span>` // Classe do idioma original
              : `<span class="portuguese">${line}</span>` // Classe do português
          )
          .join("<br>") // Junta as linhas da estrofe com quebra simples
      )
      .join("<br><br>"); // Adiciona espaço maior entre estrofes

    // Atualizar o modal
    lyricsTitle.innerText = `${songTitle} - ${artist}`;
    lyricsContent.innerHTML = formattedLyrics;

    // Exibir o modal
    lyricsModal.style.display = "block";
  } else {
    console.error("Letra não encontrada para a música:", songTitle);
  }
}

// Função para ocultar o modal ao clicar no botão de fechar
closeLyricsButton.addEventListener("click", () => {
  lyricsModal.style.display = "none";
});

// Função para exibir o botão "Visualizar Letra" ao tocar uma música
function showLyricsButton(songTitle) {
  lyricsButton.style.display = "block"; // Exibe o botão
  lyricsButton.onclick = () => showLyrics(songTitle); // Associa o clique à função showLyrics
}

// Função para tocar música
function playMusic(index) {
  const music = currentPlaylist[index];
  if (!music) {
    console.error("Música não encontrada na playlist.");
    return;
  }

  player.src = music.file;
  title.innerText = music.title;
  artist.innerText = music.artist;
  albumCover.src = music.cover;

  // Exibir o botão "Visualizar Letra"
  showLyricsButton(music.title);

  player.play().catch((error) => console.log("Erro ao tocar a música:", error));
}

// Próxima música
function nextMusic() {
  if (shuffleMode) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    } while (randomIndex === currentIndex);
    currentIndex = randomIndex;
  } else {
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
  }
  playMusic(currentIndex);
}

// Música anterior
function prevMusic() {
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playMusic(currentIndex);
}

// Alternar modo aleatório
function toggleShuffle() {
  shuffleMode = !shuffleMode;
  shuffleButton.classList.toggle("active", shuffleMode);
}

// Eventos dos botões de controle
nextButton.addEventListener("click", nextMusic);
prevButton.addEventListener("click", prevMusic);
shuffleButton.addEventListener("click", toggleShuffle);

// Reproduzir próxima música automaticamente ao terminar
player.addEventListener("ended", nextMusic);

// Botões para alternar playlists
btnPlaylist1.addEventListener("click", () => {
  currentPlaylist = availablePlaylists["playlist"];
  currentIndex = 0;
  playMusic(currentIndex);
  clearArtistInput(); // Limpar o campo ao trocar para Playlist1
});

btnPlaylist2.addEventListener("click", () => {
  currentPlaylist = availablePlaylists["playlist2"];
  currentIndex = 0;
  playMusic(currentIndex);
  clearArtistInput(); // Limpar o campo ao trocar para Playlist2
});

btnCombined.addEventListener("click", () => {
  currentPlaylist = combinedPlaylist;
  currentIndex = 0;
  playMusic(currentIndex);
  clearArtistInput(); // Limpar o campo ao trocar para Playlist Combined
});

// Carregar playlists
loadPlaylists();

// Inicializar com a primeira playlist por padrão
currentPlaylist = availablePlaylists["playlist"];
playMusic(currentIndex);

// Selecionar os elementos
const artistInput = document.getElementById("artist-input");
const filterArtistButton = document.getElementById("filter-artist-button");
const musicList = document.querySelectorAll("li[data-artist]"); // Selecionar todas as músicas

// Função para limpar o campo de entrada
function clearArtistInput() {
  artistInput.value = ""; // Limpa o valor do campo
}

// Função para filtrar músicas pelo artista
function filterByArtist() {
  const artistName = artistInput.value.trim().toLowerCase(); // Obter o nome do artista

  if (!artistName) {
    alert("Por favor, digite o nome de um artista.");
    return;
  }

  // Criar uma nova playlist baseada no filtro
  const filteredPlaylist = [];
  musicList.forEach((music) => {
    const artist = music.getAttribute("data-artist").toLowerCase();
    if (artist.includes(artistName)) {
      // Adicionar música à nova playlist
      filteredPlaylist.push({
        file: music.getAttribute("data-file"),
        title: music.getAttribute("data-title"),
        artist: music.getAttribute("data-artist"),
        cover: music.getAttribute("data-cover"),
      });
    }
  });

  if (filteredPlaylist.length === 0) {
    alert(`Nenhuma música encontrada para o artista: ${artistName}`);
    return;
  }

  // Atualizar a playlist atual e reiniciar a reprodução
  currentPlaylist = filteredPlaylist;
  currentIndex = 0;
  playMusic(currentIndex);
}

// Associar o evento ao botão de filtrar
filterArtistButton.addEventListener("click", filterByArtist);

// Selecionar o botão de Sleep Timer
const sleepTimerButton = document.getElementById("sleep-timer-button");

// Variável para armazenar o timer
let sleepTimer = null;

// Função para programar o Sleep Timer
sleepTimerButton.addEventListener("click", () => {
  // Perguntar ao usuário o tempo para o Sleep Timer (em minutos)
  const minutes = parseInt(prompt("Digite o tempo para o Sleep Timer (em minutos):"));

  if (isNaN(minutes) || minutes <= 0) {
    alert("Por favor, insira um número válido.");
    return;
  }

  const milliseconds = minutes * 60 * 1000;

  // Cancelar qualquer timer anterior
  if (sleepTimer) {
    clearTimeout(sleepTimer);
  }

  // Exibir mensagem de confirmação
  alert(`Sleep Timer programado para ${minutes} minuto(s).`);

  // Programar a parada da música após o tempo especificado
  sleepTimer = setTimeout(() => {
    player.pause(); // Parar a reprodução
    alert("Sleep Timer: Música pausada.");
    sleepTimer = null; // Resetar o timer
  }, milliseconds);
});

// Função opcional para cancelar o Sleep Timer
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sleepTimer) { // Pressionar "Esc" para cancelar
    clearTimeout(sleepTimer);
    sleepTimer = null;
    alert("Sleep Timer cancelado.");
  }
});

// Função para efeito cascata 
document.addEventListener('DOMContentLoaded', () => {
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`; // Entre 0.5s e 2s
        particle.style.animationDelay = `${Math.random() * 0.5}s`; // Pequeno atraso
        container.appendChild(particle);

        // Remove a partícula após a animação
        setTimeout(() => {
            particle.remove();
        }, 2000); // Deve corresponder à duração máxima da animação
    }

    const leftCascade = document.querySelector('.cascade.left');
    const rightCascade = document.querySelector('.cascade.right');

    if (leftCascade && rightCascade) {
        // Reduz o intervalo para criar mais partículas
        setInterval(() => createParticle(leftCascade), 100); // Mais frequente na esquerda
        setInterval(() => createParticle(rightCascade), 100); // Mais frequente na direita
    }
});
