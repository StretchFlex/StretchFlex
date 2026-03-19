//need to do a get request to backend to get the patient data and then populate the form with that data
//also need to do a post request to backend to update the patient data when the form is submitted
document.addEventListener('DOMContentLoaded', function() {
    const patientId = window.location.pathname.split('/').pop();
    const form = document.getElementById('edit-patient-form');

    // Fetch patient data and populate the form
    fetch(`/api/patients/${patientId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('first-name').value = data.firstName;
            document.getElementById('last-name').value = data.lastName;
            document.getElementById('age').value = data.age;
            document.getElementById('gender').value = data.gender;
            document.getElementById('contact-info').value = data.contactInfo;
            document.getElementById('medical-history').value = data.medicalHistory;
        })
        .catch(error => console.error('Error fetching patient data:', error));
    });

// Handle form submission to update patient data
document.getElementById('edit-patient-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const patientId = window.location.pathname.split('/').pop();
    const updatedPatientData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        contactInfo: document.getElementById('contact-info').value,
        medicalHistory: document.getElementById('medical-history').value
    };

    // Send the updated patient data to the backend
    fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedPatientData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Patient personal data updated successfully:", data);
        alert("Patient personal data updated successfully!");
        window.location.href = "editPatientMed.html";
    })
    .catch(error => {
        console.error("Error updating patient personal data:", error);
        alert("There was an error updating the patient personal information. Please try again.");
    });
}); 