document.addEventListener("DOMContentLoaded", () => {
    function updateClock() {
        const clockElement = document.getElementById('digital-clock');

        // Cria um objeto de data no horário de Brasília
        const brasiliaTime = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
        });

        // Converte a string em um objeto Date
        const [datePart, timePart] = brasiliaTime.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');

        // Formata a data
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const formattedDate = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;

        // Formata o horário
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        // Atualiza o elemento HTML com a data e hora formatados
        clockElement.innerHTML = `${formattedTime} - ${formattedDate}`;
    }

    // Atualiza o relógio a cada segundo
    setInterval(updateClock, 1000);
    updateClock(); // Chama a função imediatamente para exibir ao carregar
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
});

btnPlaylist2.addEventListener("click", () => {
  currentPlaylist = availablePlaylists["playlist2"];
  currentIndex = 0;
  playMusic(currentIndex);
});

btnCombined.addEventListener("click", () => {
  currentPlaylist = combinedPlaylist;
  currentIndex = 0;
  playMusic(currentIndex);
});

// Carregar playlists
loadPlaylists();

// Inicializar com a primeira playlist por padrão
currentPlaylist = availablePlaylists["playlist"];
playMusic(currentIndex);

