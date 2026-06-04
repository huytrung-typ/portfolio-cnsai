document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TÍNH NĂNG CUỘN MƯỢT ---
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- CẤU HÌNH PDF.JS ---
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // --- DOM Elements ---
    const projectsGrid = document.getElementById('projects-grid');
    const nativeViewer = document.getElementById('native-viewer');
    const documentArea = document.getElementById('document-render-area');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const dynamicTitle = document.getElementById('dynamic-title');
    const btnCloseViewer = document.getElementById('btn-close-viewer');
    const viewButtons = document.querySelectorAll('.view-doc-btn');

    // --- HÀM RENDER PDF BẰNG CANVAS (TỐI ƯU ĐỘ NÉT HD) ---
    async function renderPDF(url) {
        try {
            loadingSpinner.classList.remove('hidden');
            
            // Tải tệp PDF
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;

            // Lấy tỷ lệ điểm ảnh của màn hình (Chìa khóa chống mờ)
            const outputScale = window.devicePixelRatio || 1;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                
                // Scale cơ bản để hiển thị vừa màn hình
                const viewport = page.getViewport({ scale: 1.5 });
                
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const ctx = canvas.getContext('2d');
                
                // Tăng số pixel vật lý dựa trên tỷ lệ màn hình
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                
                // Ép kích thước hiển thị CSS về chuẩn
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";
                
                documentArea.appendChild(canvas);

                // Tạo ma trận chuyển đổi nét chữ
                const transform = outputScale !== 1 
                    ? [outputScale, 0, 0, outputScale, 0, 0] 
                    : null;

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
            documentArea.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Lỗi nạp tài liệu. Vui lòng đảm bảo chạy trên môi trường Localhost hoặc đã Deploy lên GitHub Pages.</p>';
            loadingSpinner.classList.add('hidden');
        }
    }

    // --- BẮT SỰ KIỆN CLICK NÚT ---
    viewButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = btn.getAttribute('data-title');
            const fileSrc = btn.getAttribute('data-src');

            documentArea.innerHTML = '';
            
            projectsGrid.classList.add('hidden');
            dynamicTitle.textContent = "| Đang xem: " + title;
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
        
        // Phá hủy dữ liệu giải phóng RAM
        documentArea.innerHTML = '';
    });
});