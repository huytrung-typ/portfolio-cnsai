document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TÍNH NĂNG CUỘN MƯỢT (SMOOTH SCROLL) ---
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- 2. TÍNH NĂNG XEM PDF NỘI TẠI (SPA UX) ---
    const projectsGrid = document.getElementById('projects-grid');
    const pdfViewer = document.getElementById('pdf-viewer');
    const pdfFrame = document.getElementById('pdf-frame');
    const dynamicTitle = document.getElementById('dynamic-title');
    const btnClosePdf = document.getElementById('btn-close-pdf');
    const viewButtons = document.querySelectorAll('.view-pdf-btn');

    // Mở file PDF khi click vào thẻ bài tập
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('data-title');
            const pdfSrc = btn.getAttribute('data-pdf-src');

            // Ẩn lưới dự án
            projectsGrid.classList.add('hidden');
            
            // Hiện tiêu đề bài đang xem và nút quay lại
            dynamicTitle.textContent = "| Đang xem: " + title;
            dynamicTitle.classList.remove('hidden');
            btnClosePdf.classList.remove('hidden');

            // Nạp iframe và hiện trình xem PDF
            pdfFrame.src = pdfSrc;
            pdfViewer.classList.remove('hidden');
        });
    });

    // Đóng file PDF và quay về lưới bài tập
    btnClosePdf.addEventListener('click', () => {
        // Hiện lại lưới dự án
        projectsGrid.classList.remove('hidden');

        // Ẩn các thành phần liên quan đến PDF
        dynamicTitle.classList.add('hidden');
        btnClosePdf.classList.add('hidden');
        pdfViewer.classList.add('hidden');

        // Xóa bộ nhớ đệm iframe
        pdfFrame.src = "";
    });
});