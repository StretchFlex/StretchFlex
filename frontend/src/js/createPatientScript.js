/* dynamic form builder and validation for patient info page */

const patientPersonalInfoFormSchema = [
    {
        name: "firstName",
        label: "First Name",
        type: "string",
        required: true,
        id: "fNameInput",
        placeholder: "Type here...",
        maxLength: 20
    },
    {
        name: "lastName",
        label: "Last Name",
        type: "string",
        required: true,
        id: "lNameInput",
        placeholder: "Type here...",
        maxLength: 20
    },
    {
        name: "email",
        label: "Email Address",
        type: "string",
        autocomplete:"email",
        required: true,
        id: "emailInput",
        placeholder: "Type here...",
        maxLength: 100,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    },
    {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        required: true,
        id: "dobInput"
    },
    {
        name: "sex",
        label: "Birth Sex",
        type: "single-choice",
        options: ["male", "female", "RND"],
        required: true
       
    },
    {
        name: "height",
        label: "Height (m)",
        type: "float",
        required: true,
        id: "heightInput",
        placeholder: "Type here...",
        step: "0.01"
    },
    {
        name: "mass",
        label: "Mass (kg)",
        type: "float",
        required: true,
        id: "massInput",
        placeholder: "Type here...",
        step: "0.01"
    },
    {
        name: "bmi",
        label: "BMI (kg/m²)",
        type: "float",
        required: true,
        id: "bmiInput",
        placeholder: "Type here...",
        step: "0.01"
    }
];

const form = document.getElementById("patientPersonalInfoForm");

function createQuestion(field) {
    const fieldId = field.id || `${field.name}Input`;
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "15px";
    if (field.type === "single-choice") wrapper.classList.add("questionSelectOne");

    // radio groups are better handled with a fieldset/legend
    if (field.type === "single-choice") {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = field.label;
        fieldset.appendChild(legend);

        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            // display:block will stack options vertically; CSS also enforces spacing
            //lbl.style.display = "inline-block";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = field.name;
            radio.value = opt;
            const radioId = `${field.name}_${opt}`;
            radio.id = radioId;
            lbl.htmlFor = radioId;

            lbl.appendChild(radio);
            lbl.appendChild(document.createTextNode(" " + opt));
            fieldset.appendChild(lbl);
        });

        wrapper.appendChild(fieldset);
        return wrapper;
    }

    const label = document.createElement("label");
    label.htmlFor = fieldId;
    label.textContent = field.label;
    wrapper.appendChild(label);
    wrapper.appendChild(document.createElement("br"));

    if (field.type === "string" || field.type === "float" || field.type === "date") {
        const input = document.createElement("input");
        input.type =
            field.type === "float"
                ? "number"
                : field.type === "date"
                ? "text"
                : "text";
        input.id = fieldId;
        input.name = field.name;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.maxLength) input.maxLength = field.maxLength;
        if (field.step) input.step = field.step;
        input.autocomplete = field.autocomplete || "off";
        wrapper.appendChild(input);

        if (field.type === "date") {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "calendar-icon";
            btn.id = "calendarButton";
            btn.innerHTML =
                '<img src="assets/images/calendar-icon.png" alt="Calendar">';
            wrapper.appendChild(btn);
            wrapper.classList.add("date-picker-wrapper");
        }
    }

    return wrapper;
}

function validateDate(dateStr) {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(dateStr)) {
        const el = document.querySelector("#dobInput");
        if (el) el.classList.add("invalid");
        return false;
    }
    const [month, day, year] = dateStr.split("/").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const isValid =
        dateObj.getMonth() + 1 === month &&
        dateObj.getDate() === day &&
        dateObj.getFullYear() === year;
    const el = document.querySelector("#dobInput");
    if (!isValid && el) el.classList.add("invalid");
    else if (el) el.classList.remove("invalid");
    return isValid;
}

function autoCorrectDate() {
    const dateInput = document.querySelector("#dobInput");
    if (!dateInput) return;
    let parts = dateInput.value.replace(/\s+/g, "").split("/");
    if (parts.length === 3) {
        let [month, day, year] = parts;
        if (month.length === 1) month = "0" + month;
        if (day.length === 1) day = "0" + day;
        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            let fullYear = currentCentury + parseInt(year, 10);
            if (currentYear - fullYear > 120) fullYear += 100;
            else if (fullYear - currentYear > 0) fullYear -= 100;
            year = fullYear.toString();
        } else if (year.length === 1) year = "000" + year;
        else if (year.length === 3) year = "0" + year;
        dateInput.value = `${month}/${day}/${year}`;
        validateDate(dateInput.value);
    }
}

async function verifyFields() {
    for (const field of patientPersonalInfoFormSchema) {
        if (!field.required) continue;

        if (field.type === "single-choice") {
            const checked = form.querySelector(
                `input[name="${field.name}"]:checked`
            );
            if (!checked) {
                alert(`Please answer: ${field.label}`);
                return false;
            }
        } else {
            const el = form.querySelector(`[name="${field.name}"]`);
            if (!el) continue;
            const val = el.value.trim();
            if (!val) {
                alert(`Please fill out: ${field.label}`);
                el.focus();
                return false;
            }
            if (field.type === "date" && !validateDate(val)) {
                alert("Please enter a valid date.");
                el.focus();
                return false;
            }
            if (field.type === "float") {
                const num = parseFloat(val);
                if (isNaN(num)) {
                    alert(`${field.label} must be a number`);
                    el.focus();
                    return false;
                }
            }
        }
    }
    // build JSON object for patient info and log it to console
    const patientData = {
        firstName: document.querySelector('[name="fName"]').value.trim(),
        lastName: document.querySelector('[name="lName"]').value.trim(),
        dateOfBirth: document.querySelector('[name="dob"]').value.trim(),
        email: document.querySelector('[name="email"]').value.trim(),
        sex: document.querySelector('input[name="sex"]:checked')?.value || null,
        height: parseFloat(document.querySelector('[name="height"]').value.trim()),
        mass: parseFloat(document.querySelector('[name="mass"]').value.trim())
    };
    //Replaced by fetch call to backend, but keeping for reference
    // alert("Patient personal information submitted successfully!");
    // window.location.href = "createPatientMed.html";
    // return true;

// //need to post request this to the backend with fetch
// fetch("/api/patient/create", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify(patientData)
// })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error("Network response was not ok");
//         }
//         return response.json();
//     })
//     .then(data => {
//
//         if (data?.PatientId) {
//             sessionStorage.setItem('selectedPatientId', data.PatientId);
//             sessionStorage.setItem('selectedPatient', `${patientData.firstName} ${patientData.lastName}`);
//         }
//         alert("Patient personal information submitted successfully!");
//         window.location.href = "createPatientMed.html";
//     })
//     .catch(error => {
//         console.error("Error saving patient data:", error);
//         alert("There was an error submitting the patient information. Please try again.");
//     });

    try {
        const response = await fetch("/api/patient/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patientData)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data?.PatientId) {
            sessionStorage.setItem('selectedPatientId', data.PatientId);
            sessionStorage.setItem('selectedPatient', `${patientData.firstName} ${patientData.lastName}`);
        }

        alert("Patient personal information submitted successfully!");
        window.location.href = "createPatientMed.html";

    } catch (error) {
        console.error("Error saving patient data:", error);
        alert("There was an error submitting the patient information. Please try again.");
    }


} //end of verifyFields

document.addEventListener("DOMContentLoaded", () => {
    patientPersonalInfoFormSchema.forEach(f => form.appendChild(createQuestion(f)));

    const dateInput = document.querySelector("#dobInput");
    if (dateInput) {
        const fp = flatpickr(dateInput, {
            dateFormat: "m/d/Y",
            allowInput: true
        });
        const calendarBtn = document.querySelector("#calendarButton");
        if (calendarBtn) calendarBtn.addEventListener("click", () => fp.open());

        dateInput.addEventListener("input", e => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length >= 3 && value.length <= 4) {
                value = value.slice(0, 2) + "/" + value.slice(2);
            } else if (value.length > 4) {
                value =
                    value.slice(0, 2) +
                    "/" +
                    value.slice(2, 4) +
                    "/" +
                    value.slice(4, 8);
            }
            e.target.value = value;
            validateDate(e.target.value);
        });
        dateInput.addEventListener("blur", autoCorrectDate);
        dateInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                autoCorrectDate();
            }
        });
    }

    document
        .getElementById("createPatientBtn")
        .addEventListener("click", verifyFields);
});

 
