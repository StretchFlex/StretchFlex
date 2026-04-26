// Check authentication on page load (both Admin and Clinician allowed)
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.top.location.href = '../index.html';
        return;
    }
});


async function verifySelection(){
    const firstName = document.getElementById('firstNameInput').value.trim();
    const lastName = document.getElementById('lastNameInput').value.trim();

    if (!firstName || !lastName) {
        alert('Please enter both first name and last name');
        return;
    }

    try {
        const response = await authenticatedFetch(`/api/patient/find/id/${encodeURIComponent(firstName)}-${encodeURIComponent(lastName)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                alert('Patient not found');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }

        const patients = await response.json();
        
        if (!patients || patients.length === 0) {
            alert('Patient not found');
            return;
        }

        // If multiple patients found, take the first one (or could show selection)
        const selectedPatient = patients[0];
        
        // Store the patient ID for downstream pages
        sessionStorage.setItem('selectedPatient', selectedPatient.patientId);
        
        alert(`Patient found: ${selectedPatient.firstName} ${selectedPatient.lastName} (ID: ${selectedPatient.patientId})`);
        
        // Navigate to the graph display page
        window.location.href = "graphDisplay.html";
        
    } catch (error) {
        console.error('Error looking up patient:', error);
        alert('Error looking up patient. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookupGoBtn').addEventListener('click', verifySelection);
});
