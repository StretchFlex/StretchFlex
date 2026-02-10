/*
(function() {
    // Function to adjust the iframe height based on its content
    function adjustIframeHeight() {
        const iframe = document.getElementById('homePageIframe');
        if (iframe && iframe.contentWindow) {
            try {
                const contentHeight = iframe.contentWindow.document.body.scrollHeight;
                iframe.style.height = contentHeight + 'px';
            } catch (error) {
                console.error('Error adjusting iframe height:', error);
            }
        }
    }
})();
*/

/*
(function() {
    // Adjust the iframe height when the content loads
    const iframe = document.getElementById('homePageIframe');
    if (iframe) {
        iframe.onload = adjustIframeHeight;
    }
})(); 
*/

/*
(function() {
    //Add event listener to adjust the iframe height when the window is resized
    window.addEventListener('resize', adjustIframeHeight); 

})();

*/

/*
(function() {
    // Initial adjustment of the iframe height when the page loads
    window.addEventListener('load', adjustIframeHeight);
})();  

*/

/*
(function() {
    // Add a MutationObserver to watch for changes in the iframe content
    const iframe = document.getElementById('homePageIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        const observer = new MutationObserver(adjustIframeHeight);
        observer.observe(iframe.contentWindow.document.body, {
            childList: true,
            subtree: true
        });
    }
})();   
*/

/*
(function() {
    // add event listener to adjust the iframe height when the user scrolls within the iframe
    const iframe = document.getElementById('homePageIframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.addEventListener('scroll', adjustIframeHeight);
    }       
})();
*/

/*
(function() {
  const iframe = document.getElementById('homePageIframe');
  let maxHeight = 2000; // Safety limit to prevent runaway growth
  let increment = 300;  // Pixels to add each time

  window.addEventListener('scroll', function() {
    const rect = iframe.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // If iframe bottom is near viewport bottom, extend height
    if (rect.bottom - windowHeight < 100 && iframe.height < maxHeight) {
      iframe.height = parseInt(iframe.height) + increment;
    }
  });
})();
*/

function resizeIframeToBottom() {
    const iframe = document.getElementById('homePageIframe');
    if (iframe) {
        const rect = iframe.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // If iframe bottom is near viewport bottom, extend height
        if (rect.bottom - windowHeight < 100 && iframe.height < 2000) { // Safety limit to prevent runaway growth
            iframe.height = parseInt(iframe.height) + 300; // Add 300px
        }
    }
}

window.addEventListener('scroll', resizeIframeToBottom);
window.addEventListener('load', resizeIframeToBottom);
window.addEventListener('resize', resizeIframeToBottom);