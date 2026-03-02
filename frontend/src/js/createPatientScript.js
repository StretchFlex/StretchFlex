
function verifyFieldsMed() {
    // validate that each question block has at least one selection
    // ignore freeform comment sections (additionalComments are not required)
    const questionBlocks = document.querySelectorAll('.questionSelectOne, .questionSelectAllOtherExclusive');
    for (const block of questionBlocks) {
        // skip hidden sections (e.g. follow-up questions that aren't visible)
        if (block.offsetParent === null) continue;

        // look for any radio or checkbox inputs inside the block
        const inputs = block.querySelectorAll('input[type=checkbox], input[type=radio]');
        let anyChecked = Array.from(inputs).some(i => i.checked);
        if (!anyChecked) {
            const errModal = new bootstrap.Modal(errorModalElement);
            errModal.show();
            if (inputs.length > 0) {
                inputs[0].focus();
                errorModalElement.addEventListener("hidden.bs.modal", () => inputs[0].focus(), { once: true });
            }
            return false;
        }
    }

    // all questions answered
    const contModal = new bootstrap.Modal(continueModalElement);
    contModal.show();
    continueModalElement.addEventListener("hidden.bs.modal", function () {
        window.location.href = "selectPatient.html";
    }, { once: true });
    return true;
}



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

        // if this field has the float class, ensure it's a valid number
        if (el.classList.contains('questionTextboxFloat')) {
            const num = parseFloat(value);
            if (isNaN(num)) {
                const errModal = new bootstrap.Modal(errorModalElement);
                errModal.show();
                el.focus();
                errorModalElement.addEventListener("hidden.bs.modal", () => el.focus(), { once: true });
                return false;
            }
        }
    }

    // make sure any single-select questions have a selection
    const selectOnes = document.querySelectorAll('.questionSelectOne');
    for (const block of selectOnes) {
        const checked = block.querySelector('input[type=radio]:checked, input[type=checkbox]:checked');
        if (!checked) {
            const errModal = new bootstrap.Modal(errorModalElement);
            errModal.show();
            const firstInput = block.querySelector('input');
            if (firstInput) {
                firstInput.focus();
                errorModalElement.addEventListener("hidden.bs.modal", () => firstInput.focus(), { once: true });
            }
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





// handle behaviour for blocks where you can select all, an "other" text entry, or choose "no"
    document.querySelectorAll('.questionSelectAllOtherExclusive').forEach(block => {
        const noOption = block.querySelector('.noOption');
        const otherOptions = block.querySelectorAll('.option:not(.otherOption)');
        const otherCheckbox = block.querySelector('.otherOption');
        const otherInput = block.querySelector('.other-input');

        // when "No" is toggled, clear everything else
        if (noOption) {
            noOption.addEventListener('change', function () {
                if (this.checked) {
                    [...otherOptions, otherCheckbox].forEach(opt => opt.checked = false);
                    if (otherInput) {
                        otherInput.style.display = 'none';
                        otherInput.value = '';
                    }
                }
            });
        }

        // when any non-no option is checked, uncheck "No"
        [...otherOptions, otherCheckbox].forEach(opt => {
            opt.addEventListener('change', function () {
                if (this.checked && noOption) {
                    noOption.checked = false;
                }
            });
        });

        // toggle visibility of the accompanying text box for "other"
        if (otherCheckbox && otherInput) {
            otherCheckbox.addEventListener('change', function () {
                if (this.checked) {
                    otherInput.style.display = 'block';
                    if (noOption) noOption.checked = false;
                } else {
                    otherInput.style.display = 'none';
                    otherInput.value = '';
                }
            });
        }
    });

    // show/hide the follow-up questions for plantar fasciitis history
    const historyRadios = document.querySelectorAll('input[name="history"]');
    const historyDetailBlock = document.getElementById('historyDetailR');
    const historyDetailBlock2 = document.getElementById('historyDetailL');
    const historyDetailNoBlock = document.getElementById('historyDetailNoR');
    const historyDetailNoBlock2 = document.getElementById('historyDetailNoL');
    historyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'yes' && radio.checked) {
                // show both yes follow-ups
                historyDetailBlock.classList.remove('hidden-question');
                historyDetailBlock2.classList.remove('hidden-question');
                // hide and clear both no follow-ups
                if (historyDetailNoBlock) {
                    historyDetailNoBlock.classList.add('hidden-question');
                    historyDetailNoBlock.querySelectorAll('input').forEach(i => {
                        if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
                    });
                }
                if (historyDetailNoBlock2) {
                    historyDetailNoBlock2.classList.add('hidden-question');
                    historyDetailNoBlock2.querySelectorAll('input').forEach(i => {
                        if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
                    });
                }
            } else if (radio.value === 'no' && radio.checked) {
                // show both no follow-ups
                if (historyDetailNoBlock) historyDetailNoBlock.classList.remove('hidden-question');
                if (historyDetailNoBlock2) historyDetailNoBlock2.classList.remove('hidden-question');
                // hide and clear both yes follow-ups
                historyDetailBlock.classList.add('hidden-question');
                historyDetailBlock.querySelectorAll('input').forEach(i => {
                    if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
                });
                historyDetailBlock2.classList.add('hidden-question');
                historyDetailBlock2.querySelectorAll('input').forEach(i => {
                    if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
                });
            }
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