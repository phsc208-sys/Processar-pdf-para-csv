// Configuração do Worker do PDF.js (necessário para performance)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let scale = 1.5; // Ajusta o zoom da pré-visualização
const canvas = document.getElementById('pdf-render');
const ctx = canvas.getContext('2d');

// Elementos da Interface
const fileInput = document.getElementById('file-input');
const addColumnBtn = document.getElementById('add-column-btn');
const processBtn = document.getElementById('process-btn');

// 1. Escutar a seleção do arquivo
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        
        reader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            renderPDF(typedarray);
        };
        
        reader.readAsArrayBuffer(file);
    }
});

// 2. Carregar e renderizar o PDF no Canvas
async function renderPDF(data) {
    try {
        // Carrega o documento
        pdfDoc = await pdfjsLib.getDocument(data).promise;
        
        // Pega a primeira página
        const page = await pdfDoc.getPage(pageNum);
        
        // Define o tamanho do canvas baseado no tamanho real da página do PDF
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Ajusta o container para ter o mesmo tamanho do PDF
        const container = document.getElementById('canvas-container');
        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;

        // Renderiza o PDF no contexto do canvas
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;

        // Habilita os botões após o carregamento
        addColumnBtn.disabled = false;
        processBtn.disabled = false;
        
        console.log("PDF carregado e renderizado com sucesso!");
        
    } catch (error) {
        console.error("Erro ao carregar PDF: ", error);
        alert("Erro ao processar o arquivo PDF.");
    }
}