document.getElementById('process-btn').addEventListener('click', async () => {
    if (!pdfDoc) return;

    const container = document.getElementById('canvas-container');
    const startLine = document.getElementById('start-line');
    const startY = parseFloat(startLine.style.top) || 0;
    
    const vGuides = Array.from(document.querySelectorAll('.guide-v'));
    const xCuts = vGuides.map(g => parseFloat(g.style.left)).sort((a, b) => a - b);
    const columnsX = [0, ...xCuts, container.offsetWidth];

    try {
        const page = await pdfDoc.getPage(1);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: scale });

        const items = textContent.items.map(item => {
            const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
            return { text: item.str, x, y };
        }).filter(item => item.y >= startY);

        const rows = [];
        items.forEach(item => {
            let foundRow = rows.find(r => Math.abs(r.y - item.y) < 5);
            if (foundRow) foundRow.items.push(item);
            else rows.push({ y: item.y, items: [item] });
        });

        rows.sort((a, b) => a.y - b.y);

        const finalData = rows.map(row => {
            const rowData = Array(columnsX.length - 1).fill("");
            row.items.forEach(item => {
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
    } catch (e) { console.error(e); }
});

function exportToCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "tabela.csv";
    link.click();
}