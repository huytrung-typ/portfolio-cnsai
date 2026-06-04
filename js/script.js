document.addEventListener('DOMContentLoaded', () => {
    
    const projectsGrid = document.getElementById('projects-grid');
    
    // Quản trị lỗi: Chỉ chạy script đồ họa nếu đang ở trang Dự án (có chứa grid)
    if (!projectsGrid) return; 

    // --- CẤU HÌNH PDF.JS ---
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // --- DOM Elements ---
    const nativeViewer = document.getElementById('native-viewer');
    const documentArea = document.getElementById('document-render-area');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const dynamicTitle = document.getElementById('dynamic-title');
    const btnCloseViewer = document.getElementById('btn-close-viewer');
    const viewButtons = document.querySelectorAll('.view-doc-btn');

    // --- HÀM RENDER PDF ---
    async function renderPDF(url) {
        try {
            loadingSpinner.classList.remove('hidden');
            
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;

            const outputScale = window.devicePixelRatio || 1;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const ctx = canvas.getContext('2d');
                
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";
                
                documentArea.appendChild(canvas);

                const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                const renderContext = {
                    canvasContext: ctx,
                    transform: transform,
                    viewport: viewport
                };
                await page.render(renderContext).promise;
            }
            
            loadingSpinner.classList.add('hidden');
            
        } catch (error) {
            console.error('Lỗi khi tải PDF: ', error);
            documentArea.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Lỗi nạp tài liệu. Vui lòng đảm bảo chạy trên môi trường Web Server.</p>';
            loadingSpinner.classList.add('hidden');
        }
    }

    // --- SỰ KIỆN NÚT BẤM ---
    viewButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = btn.getAttribute('data-title');
            const fileSrc = btn.getAttribute('data-src');

            documentArea.innerHTML = ''; // Clear RAM
            
            projectsGrid.classList.add('hidden');
            dynamicTitle.textContent = "| " + title;
            dynamicTitle.classList.remove('hidden');
            btnCloseViewer.classList.remove('hidden');
            nativeViewer.classList.remove('hidden');

            const isImage = fileSrc.match(/\.(jpeg|jpg|gif|png)$/i) != null;

            if (isImage) {
                const img = document.createElement('img');
                img.src = fileSrc;
                img.className = 'native-image';
                documentArea.appendChild(img);
            } else {
                await renderPDF(fileSrc);
            }
        });
    });

    // --- NÚT QUAY LẠI ---
    btnCloseViewer.addEventListener('click', () => {
        projectsGrid.classList.remove('hidden');
        nativeViewer.classList.add('hidden');
        dynamicTitle.classList.add('hidden');
        btnCloseViewer.classList.add('hidden');
        
        documentArea.innerHTML = ''; // Clear RAM
    });
});