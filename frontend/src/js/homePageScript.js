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



