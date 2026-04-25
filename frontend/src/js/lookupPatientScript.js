// Check authentication on page load (both Admin and Clinician allowed)
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.top.location.href = '../index.html';
        return;
    }
});


async function verifySelection(){
    const val = document.getElementById('patientInput').value.trim();
    if (!val) {
        alert('Please enter a patient name in the format: FirstName-LastName');
        return;
    }

    // Parse the input as firstName-lastName
    const nameParts = val.split('-');
    if (nameParts.length !== 2) {
        alert('Please enter the patient name in the format: FirstName-LastName');
        return;
    }

    const firstName = nameParts[0].trim();
    const lastName = nameParts[1].trim();

    if (!firstName || !lastName) {
        alert('Both first name and last name are required');
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
