pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let scale = 1.5;

const canvas = document.getElementById('pdf-render');
const ctx = canvas.getContext('2d');

document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
            renderPDF(1);
        };
        reader.readAsArrayBuffer(file);
    }
});

async function renderPDF(num) {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const container = document.getElementById('canvas-container');
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    document.getElementById('add-column-btn').disabled = false;
    document.getElementById('process-btn').disabled = false;
}