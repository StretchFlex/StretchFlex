//need to autofill the form with the existing patient medical information and then update that information when the form is submitted
document.addEventListener('DOMContentLoaded', function() {
    const patientId = window.location.pathname.split('/').pop();
    const form = document.getElementById('edit-patient-med-form');
    // Fetch patient medical data and populate the form
    fetch(`/api/patients/${patientId}/medical-info`)
        .then(response => response.json())
        .then(data => {
            // document.getElementById('current-medications').value = data.currentMedications;
            // document.getElementById('allergies').value = data.allergies;
            // document.getElementById('past-surgeries').value = data.pastSurgeries;
            // document.getElementById('family-medical-history').value = data.familyMedicalHistory;
            // document.getElementById('other-relevant-comments').value = data.otherRelevantComments;
        })
        .catch(error => console.error('Error fetching patient medical data:', error));
    });


    // UPDATE TO RUN ON BUTTON SELECT AND CHECK IF THERE ARE ANY CHANGES FIRSTBHandle form submission to update patient data
// document.getElementById('edit-patient-form').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const patientId = window.location.pathname.split('/').pop();
//     const updatedPatientData = {
//         firstName: document.getElementById('first-name').value,
//         lastName: document.getElementById('last-name').value,
//         age: document.getElementById('age').value,
//         gender: document.getElementById('gender').value,
//         contactInfo: document.getElementById('contact-info').value,
//         medicalHistory: document.getElementById('medical-history').value
//     };

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
        console.log("Patient medical data updated successfully:", data);
        alert("Patient medical data updated successfully!");
        window.location.href = "editPatientMed.html";
    })
    .catch(error => {
        console.error("Error updating patient medical data:", error);
        alert("There was an error updating the patient medical information. Please try again.");
    });
//}); 