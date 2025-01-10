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

// Função para tocar música
function playMusic(index) {
  const music = currentPlaylist[index];
  if (!music) {
    console.error('Música não encontrada na playlist.');
    return;
  }

  player.src = music.file;
  title.innerText = music.title;
  artist.innerText = music.artist;
  albumCover.src = music.cover;

  player.play().catch(error => console.log('Erro ao tocar a música:', error));
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
  shuffleButton.classList.toggle('active', shuffleMode);
}

// Eventos dos botões de controle
nextButton.addEventListener('click', nextMusic);
prevButton.addEventListener('click', prevMusic);
shuffleButton.addEventListener('click', toggleShuffle);

// Reproduzir próxima música automaticamente ao terminar
player.addEventListener('ended', nextMusic);

// Botões para alternar playlists
btnPlaylist1.addEventListener('click', () => {
  currentPlaylist = availablePlaylists['playlist'];
  currentIndex = 0;
  playMusic(currentIndex);
});

btnPlaylist2.addEventListener('click', () => {
  currentPlaylist = availablePlaylists['playlist2'];
  currentIndex = 0;
  playMusic(currentIndex);
});

btnCombined.addEventListener('click', () => {
  currentPlaylist = combinedPlaylist;
  currentIndex = 0;
  playMusic(currentIndex);
});

// Carregar playlists
loadPlaylists();

// Inicializar com a primeira playlist por padrão
currentPlaylist = availablePlaylists['playlist'];
playMusic(currentIndex);
