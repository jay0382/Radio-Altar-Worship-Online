let currentIndex = 0; // Índice da música atual
let shuffleMode = false; // Modo aleatório desativado por padrão

const player = document.getElementById('player');
const title = document.getElementById('music-title');
const effectContainer = document.getElementById('effect-container');

// Obtém a playlist diretamente do HTML
const playlistItems = document.querySelectorAll('#playlist li');
const playlist = Array.from(playlistItems).map(item => ({
  file: item.getAttribute('data-file'),
  title: item.getAttribute('data-title'),
}));

// Função para tocar música
function playMusic(index) {
  const music = playlist[index];
  if (!music) {
    console.error('Música não encontrada na playlist.');
    return;
  }

  player.src = music.file;
  title.innerText = `Tocando agora: ${music.title}`;
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
    currentIndex = (currentIndex + 1) % playlist.length; // Volta ao início se passar do final
  }
  playMusic(currentIndex);
}

// Música anterior
function prevMusic() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; // Volta ao final se for antes do início
  playMusic(currentIndex);
}

// Alternar modo aleatório
function toggleShuffle() {
  shuffleMode = !shuffleMode; // Alterna o modo aleatório
  const shuffleButton = document.getElementById('shuffle');

  if (shuffleMode) {
    shuffleButton.classList.add('active'); // Adiciona classe "active"
  } else {
    shuffleButton.classList.remove('active'); // Remove classe "active"
  }
}

// Eventos dos botões
document.getElementById('next').addEventListener('click', nextMusic);
document.getElementById('prev').addEventListener('click', prevMusic);
document.getElementById('shuffle').addEventListener('click', toggleShuffle);

// Reproduzir próxima música automaticamente ao terminar
player.addEventListener('ended', () => {
  stopEffect(); // Para o efeito
  nextMusic();  // Passa para a próxima música
});

// Iniciar efeito aleatório ao começar a música
player.addEventListener('play', startRandomEffect);

// Iniciar com a primeira música
playMusic(currentIndex);

