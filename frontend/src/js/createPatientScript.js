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


// Validate input (that there is input)
            if (fNameText === "") {
                document.getElementById("output").textContent = "Please enter all fields";
                document.getElementById("output").style.color = "red";
                return;
            }


/* Need to store data somewhere when this successfully completes */
/* Need to generate a patient id for the new patient*/


		showModal("this is the patient id for this patient");

		

            // Optional: clear the input field
            //inputField.value = "";
        }
