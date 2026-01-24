// Toggle dropdown visibility
    function toggleDropdown() {
        document.getElementById("csvDropdown").classList.toggle("show");
    }

    // Handle option selection
    function selectOption(event, value) {
        event.preventDefault(); // Prevent page jump
        document.getElementById("dropdownBtn").textContent = value; // Update button text
        document.getElementById("csvDropdown").classList.remove("show"); // Close dropdown
    }    


// Close dropdown if clicked outside
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            let dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }