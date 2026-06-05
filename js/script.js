document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // 1. TÍNH NĂNG TOÀN CỤC: THANH TIẾN TRÌNH & NÚT TRỞ VỀ ĐẦU TRANG (SCROLL UX)
    // =========================================================================
    
    // Tự động sinh thẻ div cho Thanh tiến trình và tiêm vào Body
    const progressBar = document.createElement('div');
    progressBar.id = 'global-scroll-progress';
    document.body.appendChild(progressBar);

    // Tự động sinh thẻ button cho nút Trở về đầu trang và tiêm vào Body
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'global-back-to-top';
    backToTopBtn.innerHTML = '↑'; // Sử dụng ký tự mũi tên Unicode chuẩn hệ thống
    backToTopBtn.setAttribute('aria-label', 'Trở về đầu trang');
    document.body.appendChild(backToTopBtn);

    // Lắng nghe sự kiện cuộn chuột trên toàn trục Y của trình duyệt
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Thuật toán tính toán phần trăm tiến trình cuộn màn hình
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';

        // Điều khiển ẩn/hiện nút bấm: Chỉ xuất hiện khi cuộn qua vạch 300px
        if (scrollTop > 300) {
            backToTopBtn.classList.add('activated');
        } else {
            backToTopBtn.classList.remove('activated');
        }
    });

    // Bắt sự kiện click để đưa người dùng về đỉnh trang một cách mượt mà
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Cuộn mượt mà chuẩn native
        });
    });


    // =========================================================================
    // 2. TÍNH NĂNG RIÊNG: KHU VỰC QUẢN LÝ DỰ ÁN VÀ DỰNG HÌNH PDF (PROJECTS PAGE)
    // =========================================================================
    const projectsGrid = document.getElementById('projects-grid');
    const mainContainer = document.getElementById('main-container'); 
    
    // Ngàm chặn hệ thống: Nếu không có grid dự án (ở trang index/summary) thì ngưng chạy đoạn dưới
    if (!projectsGrid) return; 

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } catch(e) {
        console.warn("Thư viện PDF.js đang được tải...");
    }

    const nativeViewer = document.getElementById('native-viewer');
    const documentArea = document.getElementById('document-render-area');
    const sidebarContent = document.getElementById('sidebar-content'); 
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const dynamicTitle = document.getElementById('dynamic-title');
    const btnCloseViewer = document.getElementById('btn-close-viewer');
    const viewButtons = document.querySelectorAll('.view-doc-btn');

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
                canvas.style.width = "100%"; 
                
                documentArea.appendChild(canvas);
                const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
                await page.render({ canvasContext: ctx, transform: transform, viewport: viewport }).promise;
            }
            loadingSpinner.classList.add('hidden');
        } catch (error) {
            console.error('Lỗi khi tải PDF: ', error);
            documentArea.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Lỗi nạp tài liệu. Xin chờ giây lát hoặc làm mới trang.</p>';
            loadingSpinner.classList.add('hidden');
        }
    }

    viewButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = btn.getAttribute('data-title');
            const fileSrc = btn.getAttribute('data-src');
            
            const cardElement = btn.closest('.card');
            const hiddenData = cardElement.querySelector('.project-details-data');

            documentArea.innerHTML = ''; 
            sidebarContent.innerHTML = hiddenData.innerHTML; 
            
            mainContainer.classList.add('expanded-mode');
            
            projectsGrid.classList.add('hidden');
            dynamicTitle.textContent = "| " + title;
            dynamicTitle.classList.remove('hidden');
            btnCloseViewer.classList.remove('hidden');
            nativeViewer.classList.remove('hidden');

            setTimeout(() => {
                const headerOffset = document.querySelector('.section-header-flex');
                if(headerOffset) {
                    headerOffset.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50);

            const isImage = fileSrc.match(/\.(jpeg|jpg|gif|png)$/i) != null;

            if (isImage) {
                const img = document.createElement('img');
                img.src = fileSrc;
                img.className = 'native-image';
                documentArea.appendChild(img);
            } else {
                if(typeof pdfjsLib !== 'undefined') {
                    await renderPDF(fileSrc);
                } else {
                    documentArea.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Hệ thống đang tải thư viện, vui lòng bấm F5.</p>';
                }
            }
        });
    });

    btnCloseViewer.addEventListener('click', () => {
        mainContainer.classList.remove('expanded-mode');
        
        projectsGrid.classList.remove('hidden');
        nativeViewer.classList.add('hidden');
        dynamicTitle.classList.add('hidden');
        btnCloseViewer.classList.add('hidden');
        
        documentArea.innerHTML = ''; 
        sidebarContent.innerHTML = '';

        setTimeout(() => {
            const headerOffset = document.querySelector('.section-header-flex');
            if(headerOffset) {
                headerOffset.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    });
});