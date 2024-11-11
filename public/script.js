// Set workerSrc path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

const pdfPath = 'path/to/your.pdf'; // Replace with an actual PDF URL or file path
let pdfDoc = null;
let currentPage = 1;
const pdfContainer = document.getElementById('pdf-container');
const pageNumberDisplay = document.getElementById('page-number');
const socket = io();

// Load the PDF document
pdfjsLib.getDocument(pdfPath).promise.then((pdf) => {
    pdfDoc = pdf;
    renderPage(currentPage);
}).catch((error) => {
    console.error("Error loading PDF:", error);
    alert('Error loading PDF. Check the file path or URL.');
});

// Render a specific page
function renderPage(pageNumber) {
    pdfDoc.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        pdfContainer.innerHTML = ''; // Clear existing page
        pdfContainer.appendChild(canvas);

        // Render the page on the canvas
        page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
            pageNumberDisplay.textContent = `Page ${pageNumber}`;
        }).catch((renderError) => {
            console.error("Error rendering page:", renderError);
        });
    }).catch((error) => {
        console.error("Error getting page:", error);
    });
}

// Event listeners for navigation buttons
document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
        socket.emit('changePage', currentPage); // Notify server of page change
    }
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        socket.emit('changePage', currentPage); // Notify server of page change
    }
});

// Listen for page change events from the server
socket.on('pageChanged', (page) => {
    currentPage = page;
    renderPage(page); // Update page for all clients
});

