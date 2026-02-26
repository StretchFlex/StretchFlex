/*

function showContinueModal(message) {
document.getElementById("modal-message").textContent = message;
document.getElementById("overlay").style.display = "block";
}

function showErrorModal(message) {
document.getElementById("modal-message").textContent = message;
document.getElementById("overlay").style.display = "block";
}

function showDoneModal(message) {
document.getElementById("modal-message").textContent = message;
document.getElementById("overlay").style.display = "block";
}

function closeContinueModal() {
document.getElementById("overlay").style.display = "none";
window.location.href = "createPatientMed.html";
}

function closeErrorModal() {
document.getElementById("overlay").style.display = "none";
}

function closeDoneModal() {
document.getElementById("overlay").style.display = "none";
window.location.href = "selectPatient.html";
}



function verifyFieldsMed() {
//make sure dropdown for plantarfaciitis is selected
const plantarFaciitisDropdown = document.getElementById("plantarFaciitisDropdown");
const plantarFaciitisChecked = plantarFaciitisDropdown.value !== "";

if (!plantarFaciitisChecked) {
showErrorModal("Please select a value for Plantar Fasciitis");
}

/* Need to store data somewhere when this successfully completes */
/* Need to generate a patient ID that has not been used before */

/*
const patientID = Math.floor(Math.random() * 1000000); // Example: random ID generation
showDoneModal("Patient created successfully! Your patient ID is: " + patientID);
// Optional: clear the input field
//inputField.value = "";
}
*/



// modal element references reused by verifyFields
const continueModalElement = document.getElementById("continueModal");
const errorModalElement = document.getElementById("errorModal");

function verifyFields() {
    // list of required input ids in the order we want to validate/focus
    const inputs = [
        { id: "fNameInput", label: "First Name" },
        { id: "lNameInput", label: "Last Name" },
        { id: "dobInput", label: "Date of Birth" },
        { id: "emailInput", label: "Email Address" },
        { id: "sexInput", label: "Birth Sex" },
        { id: "heightInput", label: "Height" },
        { id: "massInput", label: "Mass" }
    ];

    for (const field of inputs) {
        const el = document.getElementById(field.id);
        if (!el) continue; // should not happen

        const value = el.value.trim();
        const isEmpty = value === "";
        const invalidDate = field.id === "dobInput" && value !== "" && !validateDate(value);

        if (isEmpty || invalidDate) {
            // show error and focus the problematic element
            const errModal = new bootstrap.Modal(errorModalElement);
            errModal.show();
            el.focus();
            // ensure focus is restored after the modal closes
            errorModalElement.addEventListener("hidden.bs.modal", () => el.focus(), { once: true });
            return false;
        }
    }

    // all fields have values (and dob is valid)
    const contModal = new bootstrap.Modal(continueModalElement);
    contModal.show();
    continueModalElement.addEventListener("hidden.bs.modal", function () {
        window.location.href = "createPatientMed.html";
    }, { once: true });
    return true;
}





// Loop through each question block
    document.querySelectorAll('.questionType1').forEach(questionBlock1 => {
        const noOption = questionBlock1.querySelector('.noOption');
        const otherOptions = questionBlock1.querySelectorAll('.option:not(.otherOption)');
        const otherCheckbox = questionBlock1.querySelector('.otherOption');
        const otherInput = questionBlock1.querySelector('.other-input');

        // If "No" is selected, uncheck all others in this question
        noOption.addEventListener('change', function () {
            if (this.checked) {
                [...otherOptions, otherCheckbox].forEach(opt => opt.checked = false);
                otherInput.style.display = 'none';
                otherInput.value = '';
            }
        });

        // If any other option is selected, uncheck "No" in this question
        [...otherOptions, otherCheckbox].forEach(opt => {
            opt.addEventListener('change', function () {
                if (this.checked) {
                    noOption.checked = false;
                }
            });
        });

        // Show/hide "Other" text box
        otherCheckbox.addEventListener('change', function () {
            if (this.checked) {
                otherInput.style.display = 'block';
                noOption.checked = false; // Ensure "No" is unchecked
            } else {
                otherInput.style.display = 'none';
                otherInput.value = '';
            }
        });
    });


    // Loop through each question block
    document.querySelectorAll('.questionType2').forEach(questionBlock2 => {
        const noOption = questionBlock2.querySelector('.noOption');
        const otherOptions = questionBlock2.querySelectorAll('.option:not(.otherOption)');
        const otherCheckbox = questionBlock2.querySelector('.otherOption');

        // If "No" is selected, uncheck all others in this question
        noOption.addEventListener('change', function () {
            if (this.checked) {
                [...otherOptions, otherCheckbox].forEach(opt => opt.checked = false);
                otherInput.style.display = 'none';
                otherInput.value = '';
            }
        });

        // If any other option is selected, uncheck "No" in this question
        [...otherOptions, otherCheckbox].forEach(opt => {
            opt.addEventListener('change', function () {
                if (this.checked) {
                    noOption.checked = false;
                }
            });
        });

        
    });


    // Initialize Flatpickr
    const dateInput = document.querySelector("#dobInput");
    const calendarBtn = document.querySelector("#calendarButton");

    const fp = flatpickr(dateInput, {
        dateFormat: "m/d/Y",
        allowInput: true // allow manual typing
    });

    // Open calendar when icon is clicked
    calendarBtn.addEventListener("click", () => {
        fp.open();
    });

// Auto-insert slashes while typing
    dateInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 3 && value.length <= 4) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        } else if (value.length > 4) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
        }
        e.target.value = value;
        validateDate(e.target.value);
    });

    // Auto-correct on blur or Enter
    dateInput.addEventListener("blur", autoCorrectDate);
    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            autoCorrectDate();
        }
    });

    function autoCorrectDate() {
        let parts = dateInput.value.replace(/\s+/g, "").split("/");
        if (parts.length === 3) {
            let [month, day, year] = parts;

            // Pad month/day
            if (month.length === 1) month = "0" + month;
            if (day.length === 1) day = "0" + day;

            // Smart year guessing
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                const fullYear = currentCentury + parseInt(year, 10);

                // If guessed year is more than 120 years ago, shift forward a century
                if (currentYear - fullYear > 120) {
                    year = (fullYear + 100).toString();
                }
                // If guessed year is more than 0 years in the future, shift back a century
                else if (fullYear - currentYear > 0) {
                    year = (fullYear - 100).toString();
                } else {
                    year = fullYear.toString();
                }
            } else if (year.length === 1) {
                year = "000" + year; // unlikely, but keep consistent
            } else if (year.length === 3) {
                year = "0" + year;
            }

            const corrected = `${month}/${day}/${year}`;
            dateInput.value = corrected;
            validateDate(corrected);
        }
    }

    // Validate date in MM/DD/YYYY format
    function validateDate(dateStr) {
        const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
        if (!regex.test(dateStr)) {
            dateInput.classList.add("invalid");
            return false;
        }

        const [month, day, year] = dateStr.split("/").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const isValid = dateObj.getMonth() + 1 === month &&
                        dateObj.getDate() === day &&
                        dateObj.getFullYear() === year;

        if (!isValid) {
            dateInput.classList.add("invalid");
            return false;
        }

        dateInput.classList.remove("invalid");
        return true;
    }