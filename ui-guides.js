(function() {
    let activeGuide = null;
    let offset = 0;

    const container = document.getElementById('canvas-container');
    const overlay = document.getElementById('overlay');
    const startLine = document.getElementById('start-line');

    function makeDraggable(el, isVertical = false) {
        el.addEventListener('mousedown', (e) => {
            activeGuide = el;
            offset = isVertical ? (e.clientX - el.offsetLeft) : (e.clientY - el.offsetTop);
            el.style.backgroundColor = "rgba(255, 255, 0, 0.5)";
        });
    }

    makeDraggable(startLine);

    document.addEventListener('mousemove', (e) => {
        if (!activeGuide) return;
        const rect = container.getBoundingClientRect();
        
        if (activeGuide.classList.contains('guide-h')) {
            let y = e.clientY - rect.top - offset;
            y = Math.max(0, Math.min(y, rect.height - 5));
            activeGuide.style.top = `${y}px`;
        } else {
            let x = e.clientX - rect.left - offset;
            x = Math.max(0, Math.min(x, rect.width - 5));
            activeGuide.style.left = `${x}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (activeGuide) {
            activeGuide.style.backgroundColor = "";
            activeGuide = null;
        }
    });

    document.getElementById('add-column-btn').addEventListener('click', () => {
        const newCol = document.createElement('div');
        newCol.className = 'guide-v';
        newCol.style.left = `${container.offsetWidth / 2}px`;
        overlay.appendChild(newCol);
        makeDraggable(newCol, true);
    });
})();