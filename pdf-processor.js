// pdf-processor.js

processBtn.addEventListener('click', async () => {
    if (!pdfDoc) return;

    // 1. Pegar as coordenadas das réguas (em pixels)
    const rect = container.getBoundingClientRect();
    const startY = parseFloat(startLine.style.top);
    
    // Pegar todos os eixos X das colunas e ordenar da esquerda para a direita
    const vGuides = Array.from(document.querySelectorAll('.guide-v'));
    const xCuts = vGuides.map(g => parseFloat(g.style.left)).sort((a, b) => a - b);
    
    // Adicionamos as bordas laterais para fechar as colunas
    const columnsX = [0, ...xCuts, container.offsetWidth];

    try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: scale });

        // 2. Filtrar e Agrupar o Texto
        // O PDF.js retorna itens com 'transform' [scaleX, 0, 0, scaleY, x, y]
        const rawItems = textContent.items.map(item => {
            // Converter coordenadas do PDF para as coordenadas do nosso Canvas/Tela
            const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
            return { text: item.str, x, y };
        });

        // Filtrar apenas o que está abaixo da linha inicial definida pelo usuário
        const tableItems = rawItems.filter(item => item.y >= startY);

        // 3. Agrupar itens em linhas (se a diferença de Y for pequena, é a mesma linha)
        const rows = [];
        const thresholdY = 5; // Margem de erro em pixels para alinhar a linha

        tableItems.forEach(item => {
            let foundRow = rows.find(r => Math.abs(r.y - item.y) < thresholdY);
            if (foundRow) {
                foundRow.items.push(item);
            } else {
                rows.push({ y: item.y, items: [item] });
            }
        });

        // Ordenar as linhas de cima para baixo
        rows.sort((a, b) => a.y - b.y);

        // 4. Distribuir o texto nas colunas baseadas nos eixos X
        const finalData = rows.map(row => {
            const rowData = Array(columnsX.length - 1).fill("");
            
            row.items.forEach(item => {
                // Encontrar em qual "faixa" de X o texto caiu
                for (let i = 0; i < columnsX.length - 1; i++) {
                    if (item.x >= columnsX[i] && item.x <= columnsX[i+1]) {
                        rowData[i] += (rowData[i] ? " " : "") + item.text;
                        break;
                    }
                }
            });
            return rowData;
        });

        exportToCSV(finalData);

    } catch (error) {
        console.error("Erro no processamento:", error);
    }
});

// 5. Função para gerar e baixar o arquivo CSV
function exportToCSV(data) {
    let csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "extrato_processado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}