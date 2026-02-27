const iframe = document.getElementById('homePageIframe');
function adjustIframeHeight() {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const contentHeight = iframeDoc.documentElement.scrollHeight;
        const extraHeight = window.scrollY;
        iframe.style.height = Math.min(contentHeight + window.innerHeight + extraHeight, 3000) + 'px'; 
        
    } catch (e) {
        console.error("Error adjusting iframe height:", e);
    }
}


window.addEventListener('load', adjustIframeHeight);

window.addEventListener('scroll', adjustIframeHeight);

window.addEventListener('resize', adjustIframeHeight);


/* Added to make iframe width the same as view window so full border shows */
function updateScrollbarWidth() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
}

window.addEventListener('load', updateScrollbarWidth);
window.addEventListener('resize', updateScrollbarWidth);
updateScrollbarWidth();



