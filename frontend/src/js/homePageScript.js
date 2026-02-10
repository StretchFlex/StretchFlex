/*
function resizeIframeToBottom() {
    const iframe = document.getElementById('homePageIframe');
    if (iframe) {
        const rect = iframe.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // If iframe bottom is near viewport bottom, extend height
        if (rect.bottom - windowHeight < 100 && iframe.height < 5000) { // Safety limit to prevent runaway growth
            iframe.height = parseInt(iframe.height) + 300; // Add 300px
        }
    }
}

window.addEventListener('load', resizeIframeToBottom);

window.addEventListener('scroll', resizeIframeToBottom);

window.addEventListener('resize', resizeIframeToBottom);
*/

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



