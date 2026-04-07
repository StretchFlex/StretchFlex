
//Function Probably does not work due to window event listeners adjustIframeHeight below
// document.addEventListener("DOMContentLoaded", function () {
//     window.scrollTo(0, 0); // Scroll to the top of the page on load

//     const iframe = document.getElementById("homePageIframe");

//     // Wait until the iframe content is fully loaded
//     iframe.addEventListener("load", function () {
//         try {
//             // Ensure same-origin policy allows access
//             iframe.contentWindow.scrollTo(0, 0);
//         } catch (err) {
//             console.warn("Cannot access iframe contents due to cross-origin restrictions.");
//         }

//         // Also scroll the main page to the iframe's top position
//         //iframe.scrollIntoView({ behavior: "smooth", block: "start" });
//     });
// });

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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('backBtn').addEventListener('click', () => window.history.back());
    document.getElementById('logoutBtn').addEventListener('click', () => window.location.href='index.html');
});



