let currentIndex = 0; // Índice da música atual
let shuffleMode = false; // Modo aleatório desativado por padrão

const player = document.getElementById('player');
const albumCover = document.getElementById('current-album'); // Elemento para a capa do álbum
const shuffleButton = document.getElementById('shuffle');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const effectContainer = document.getElementById('effect-container'); // Efeitos visuais
const title = document.getElementById('music-title'); // Título da música
const artist = document.getElementById('music-artist'); // Nome do artista

// Obtém a playlist diretamente do HTML
const playlistItems = document.querySelectorAll('#playlist li');
const playlist = Array.from(playlistItems).map(item => ({
  file: item.getAttribute('data-file'),
  cover: item.getAttribute('data-cover') || 'images/default-cover.jpg', // Capa da música ou imagem padrão
  title: item.getAttribute('data-title'), // Nome da música
  artist: item.getAttribute('data-artist') || 'Artista Desconhecido' // Nome do artista
}));

// Função para tocar música
function playMusic(index) {
  const music = playlist[index];
  if (!music) {
    console.error('Música não encontrada na playlist.');
    return;
  }

  player.src = music.file;

  // Atualiza as informações da música
  title.innerText = music.title; // Nome da música
  artist.innerText = music.artist; // Nome do artista
  albumCover.src = music.cover; // Atualiza a capa do álbum

  // Inicia a reprodução
  player.play().catch(error => console.log('Erro ao tocar a música:', error));
}

// Iniciar efeito aleatório
function startRandomEffect() {
  // Limpar efeitos existentes
  effectContainer.className = "effect";

  // Escolher um efeito aleatório entre 1 e 10
  const randomEffect = `effect-${Math.floor(Math.random() * 10) + 1}`;
  effectContainer.classList.add(randomEffect);
}

// Parar o efeito
function stopEffect() {
  effectContainer.className = "effect"; // Limpar os efeitos
}

// Próxima música
function nextMusic() {
  if (shuffleMode) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentIndex); // Garante que a próxima música seja diferente
    currentIndex = randomIndex;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length; // Volta ao início no final da lista
  }
  playMusic(currentIndex);
}

// Música anterior
function prevMusic() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; // Volta ao final se no início
  playMusic(currentIndex);
}

// Alternar modo aleatório
function toggleShuffle() {
  shuffleMode = !shuffleMode; // Alterna o modo aleatório

  if (shuffleMode) {
    shuffleButton.classList.add('active'); // Adiciona classe "active" ao botão
  } else {
    shuffleButton.classList.remove('active'); // Remove classe "active" do botão
  }
}

// Eventos dos botões
nextButton.addEventListener('click', nextMusic);
prevButton.addEventListener('click', prevMusic);
shuffleButton.addEventListener('click', toggleShuffle);

// Reproduzir próxima música automaticamente ao terminar
player.addEventListener('ended', () => {
  stopEffect(); // Para o efeito
  nextMusic(); // Passa para a próxima música
});

// Iniciar efeito aleatório ao começar a música
player.addEventListener('play', startRandomEffect);

// Iniciar com a primeira música
playMusic(currentIndex);

