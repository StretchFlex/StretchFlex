function showModal(message) {
document.getElementById("modal-message").textContent = message;
document.getElementById("overlay").style.display = "block";
}

function closeModal() {
document.getElementById("overlay").style.display = "none";
window.location.href = "selectPatient.html";
}

function verifyFields() {
// Get the value from the first name input field
const fNameInputField = document.getElementById("fNameInput");
const fNameText = fNameInputField.value.trim();

// Get the value from the last name input field
const lNameInputField = document.getElementById("lNameInput");
const lNameText = lNameInputField.value.trim();
const ageInputField = document.getElementById("ageInput");
const ageText = ageInputField.value.trim();
const conditionsInputField = document.getElementById("conditionsInput");
const conditionsText = conditionsInputField.value.trim();

// Validate input (that there is input)
if (fNameText === "" || lNameText === "" || ageText === "" || conditionsText === "") {
document.getElementById("output").textContent = "Please enter all fields";
document.getElementById("output").style.color = "red";
return;
}

/* Need to store data somewhere when this successfully completes */
/* Need to generate a patient ID that has not been used before */

const patientID = Math.floor(Math.random() * 1000000); // Example: random ID generation
showModal("this is the patient id for this patient");
// Optional: clear the input field
//inputField.value = "";
}