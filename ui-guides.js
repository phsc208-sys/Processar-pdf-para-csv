let activeGuide = null;
let offset = 0;

const container = document.getElementById('canvas-container');
const overlay = document.getElementById('overlay');
const startLine = document.getElementById('start-line');
const addColumnBtn = document.getElementById('add-column-btn');

// --- 1. Lógica de Arrastar ---

function makeDraggable(el, isVertical = false) {
    el.addEventListener('mousedown', (e) => {
        activeGuide = el;
        // Calcula a distância entre o clique e o topo/esquerda do elemento
        if (isVertical) {
            offset = e.clientX - el.offsetLeft;
        } else {
            offset = e.clientY - el.offsetTop;
        }
        el.style.backgroundColor = "rgba(255, 255, 0, 0.5)"; // Feedback visual
    });
}

// Inicializa a linha horizontal de início
makeDraggable(startLine);

// Evento global para mover a linha
document.addEventListener('mousemove', (e) => {
    if (!activeGuide) return;

    const rect = container.getBoundingClientRect();
    
    if (activeGuide.classList.contains('guide-h')) {
        // Move horizontalmente (Eixo Y)
        let y = e.clientY - rect.top - offset;
        // Limita dentro do container
        y = Math.max(0, Math.min(y, rect.height - 5));
        activeGuide.style.top = `${y}px`;
    } else {
        // Move verticalmente (Eixo X)
        let x = e.clientX - rect.left - offset;
        x = Math.max(0, Math.min(x, rect.width - 5));
        activeGuide.style.left = `${x}px`;
    }
});

// Soltar a linha
document.addEventListener('mouseup', () => {
    if (activeGuide) {
        activeGuide.style.backgroundColor = ""; // Remove o destaque
        activeGuide = null;
    }
});

// --- 2. Lógica de Criar Colunas ---

addColumnBtn.addEventListener('click', () => {
    const newCol = document.createElement('div');
    newCol.className = 'guide-v';
    newCol.title = "Arraste para definir a divisão da coluna";
    
    // Posiciona no meio do container inicialmente
    newCol.style.left = `${container.offsetWidth / 2}px`;
    
    overlay.appendChild(newCol);
    makeDraggable(newCol, true); // Torna a nova coluna arrastável
});