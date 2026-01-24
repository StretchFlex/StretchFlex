// Toggle dropdown visibility
    function toggleDropdown() {
        document.getElementById("patientDropdown").classList.toggle("show");
    }

    // Handle option selection
    function selectOption(event, value) {
        event.preventDefault(); // Prevent page jump
        document.getElementById("dropdownBtn").textContent = value; // Update button text
        document.getElementById("patientDropdown").classList.remove("show"); // Close dropdown
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


function createPatient(){
window.location.href = "createPatient.html"
}

function verifySelection(){
//need to add verification of a proper selection here

window.location.href = "graphDisplay.html";

}
