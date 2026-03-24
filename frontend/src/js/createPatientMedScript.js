//do a GET request to the backend to get the latest patient ID and store it in a variable for use in the medical info form submission
let patientId = null;
fetch("/api/patients/latest")
    .then(response => response.json())
    .then(data => {
        patientId = data.id; // assuming the response contains the new patient's ID in an 'id' field
        console.log("Received patient ID:", patientId);
    })
    .catch(error => console.error("Error fetching latest patient ID:", error));

// rest of the code that builds the form and handles submission

const patientMedicalInfoFormSchema = [
    //section to display patient ID for reference, not editable
    {
        name: "patientId",
        label: "Patient ID",
        type: "string",
        required: false,
        readOnly: true
    },
    
    // history of plantar fasciitis section
    { // historyOfPF
        name: "responseOfHistory",
        label: "Do you have a history of Plantar Fasciitis?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    // if yes: time since diagnosis
    {
        name: "rightFoot",
        label: "How long since your diagnosis in your right foot?",
        type: "single-choice",
        options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"],
        dependsOn: { field: "responseOfHistory", value: "Yes" }
    },
    {
        name: "leftFoot",
        label: "How long since your diagnosis in your left foot?",
        type: "single-choice",
        options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"],
        dependsOn: { field: "responseOfHistory", value: "Yes" }
    },
    // if no: pain duration questions reuse same names so hidden logic skips them when not applicable
    {
        name: "rightFoot",
        label: "How long have you experienced pain or discomfort in your right foot?",
        type: "single-choice",
        options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"],
        dependsOn: { field: "responseOfHistory", value: "No" }
    },
    {
        name: "leftFoot",
        label: "How long have you experienced pain or discomfort in your left foot?",
        type: "single-choice",
        options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"],
        dependsOn: { field: "responseOfHistory", value: "No" }
    },
    {
        name: "historyAdditionalComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },
    // right foot conditions
    {
        name: "rightConditions",
        label: "Have you experienced any of the following conditions to your Right Foot?",
        type: "multi-choice",
        options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "No"],
        allowOther: true,
        required: true
    },
    {
        name: "rightConditionsComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },    
    // left foot conditions
    {
        name: "leftConditions",
        label: "Have you experienced any of the following conditions to your Left Foot?",
        type: "multi-choice",
        options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "No"],
        allowOther: true,
        required: true
    },
    {
        name: "leftConditionsComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },    
    // surgeries
    {
        name: "surgeryRight",
        label: "Have you previously had surgery to your right leg at or below the knee?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    {
        name: "surgeryRightComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },    
    {
        name: "surgeryLeft",
        label: "Have you previously had surgery to your left leg at or below the knee?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    {
        name: "surgeryLeftComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },
    // treatments
    {
        name: "treatments",
        label: "Are you currently using any of the following at home treatments?",
        type: "multi-choice",
        options: ["Rest", "Stretch", "Ice", "Compression", "Elevation", "Brace", "Insole", "Medication", "No"],
        required: true
    },
    {
        name: "treatmentsComments",
        label: "Additional Comments",
        type: "string",
        required: false,
        maxLength: 550
    },
    {
        name: "otherRelevantComments",
        label: "Do you have any other relevant conditions to report?",
        type: "string",
        required: false,
        maxLength: 550
    }
];

const form = document.getElementById("patientMedicalInfoForm");

// helper that creates a single question block and wires dependency metadata
function createQuestion(field) {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "15px";

    if (field.dependsOn) {
        wrapper.classList.add("hidden-question");
        wrapper.dataset.dependsField = field.dependsOn.field;
        wrapper.dataset.dependsValue = field.dependsOn.value;
    }

    const label = document.createElement("label");
    label.textContent = field.label;
    wrapper.appendChild(label);
    wrapper.appendChild(document.createElement("br"));

    if (field.type === "string" || field.type === "integer") {
        const input = document.createElement("input");
        input.type = field.type === "integer" ? "number" : "text";
        input.name = field.name;
        if (field.type === "integer") {
            input.step = "0.01";
            input.min = "1";
        }
        wrapper.appendChild(input);
    } else if (field.type === "single-choice") {
        wrapper.classList.add("questionSelectOne");
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            // stack vertically instead of inline
            //lbl.style.display = "inline-block";
            lbl.innerHTML = `<input type="radio" name="${field.name}" value="${opt}"> ${opt}`;
            wrapper.appendChild(lbl);
        });
    } else if (field.type === "multi-choice") {
        wrapper.classList.add("questionSelectAllOtherExclusive");
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            // vertical stack
            //lbl.style.display = "inline-block";
            lbl.innerHTML = `<input type="checkbox" name="${field.name}" value="${opt}"> ${opt}`;
            wrapper.appendChild(lbl);
        });
        if (field.allowOther) {
            const lbl = document.createElement("label");
            lbl.innerHTML = `<input type="checkbox" name="${field.name}" value="Other" class="other-option"> Other`;
            wrapper.appendChild(lbl);
            const otherInput = document.createElement("input");
            otherInput.type = "text";
            otherInput.className = "other-text";
            otherInput.placeholder = "Please specify";
            otherInput.style.display = "none";
            wrapper.appendChild(otherInput);
        }
    }

    return wrapper;
}

// build the form on load
patientMedicalInfoFormSchema.forEach(field => {
    form.appendChild(createQuestion(field));
});

// ensure any dependent questions are hidden initially
refreshDependencies();

// show/hide dependent questions
function refreshDependencies() {
    patientMedicalInfoFormSchema.forEach(field => {
        if (!field.dependsOn) return;
        const wrappers = form.querySelectorAll(
            `div[data-depends-field="${field.dependsOn.field}"][data-depends-value="${field.dependsOn.value}"]`
        );
        if (wrappers.length === 0) return;
        const controllerValue = form.querySelector(
            `[name="${field.dependsOn.field}"]:checked`
        )?.value;
        wrappers.forEach(wrapper => {
            if (controllerValue === field.dependsOn.value) {
                wrapper.classList.remove("hidden-question");
            } else {
                wrapper.classList.add("hidden-question");
                // clear any inputs inside
                wrapper.querySelectorAll("input").forEach(i => {
                    if (i.type === "radio" || i.type === "checkbox") i.checked = false;
                    else i.value = "";
                });
            }
        });
    });
}

// listen for changes to update dependencies, show other-text fields and enforce exclusivity rules
form.addEventListener("change", function (e) {
    // show/hide "other" text box
    if (e.target.classList.contains("other-option")) {
        const textField = e.target.closest("label").nextElementSibling;
        if (e.target.checked) {
            textField.style.display = "inline-block";
        } else {
            textField.style.display = "none";
            textField.value = "";
        }
    }

    // enforce "No" checkbox exclusivity in multi-choice groups
    if (e.target.type === "checkbox") {
        const name = e.target.name;
        const value = e.target.value.toLowerCase();
        if (value === "no" && e.target.checked) {
            // uncheck every other option in the same group
            form.querySelectorAll(`input[name="${name}"]:not([value="No"])`).forEach(cb => cb.checked = false);
            // also hide/clear any "other" text inputs in the group
            form.querySelectorAll(`input[name="${name}"].other-option`).forEach(otherCb => {
                const textField = otherCb.closest("label").nextElementSibling;
                if (textField) {
                    textField.style.display = "none";
                    textField.value = "";
                    otherCb.checked = false; // uncheck the other option
                }
            });
        } else if (e.target.checked) {
            // if any other option is checked, uncheck the "No" box
            const noBox = form.querySelector(`input[name="${name}"][value="No"]`);
            if (noBox) noBox.checked = false;
        }
    }

    // refresh conditional questions after any change
    refreshDependencies();
});

// validation helper using alerts; returns false if any visible question is unanswered
function verifyFieldsMed() {
    const questionBlocks = document.querySelectorAll(
        ".questionSelectOne, .questionSelectAllOtherExclusive"
    );
    for (const block of questionBlocks) {
        // skip sections that are hidden by dependency logic
        if (block.closest(".hidden-question") || block.offsetParent === null)
            continue;

        const inputs = block.querySelectorAll(
            "input[type=checkbox], input[type=radio]"
        );
        if (inputs.length === 0) continue; // nothing to check

        if (!Array.from(inputs).some(i => i.checked)) {
            // find the question label inside this block
            const questionLabel = block.querySelector('label')?.textContent || 'this question';
            alert(`Please answer: ${questionLabel}`);
            if (inputs.length > 0) inputs[0].focus();
            return false;
        }
    }

    // all visible questions have an answer
    return true;
}

// convert form to JSON and run validation on finish
document.getElementById("finishBtn").addEventListener("click", function () {
    if (!verifyFieldsMed()) return;

    const jsonData = {};
    patientMedicalInfoFormSchema.forEach(field => {
        // skip hidden questions when building data
        const elementWrapper = form.querySelector(
            `[name="${field.name}"]`
        )?.closest("div");
        if (elementWrapper && elementWrapper.closest(".hidden-question")) return;

        let value = null;
        if (field.type === "string") {
            value = form.querySelector(`[name="${field.name}"]`).value.trim();
        } else if (field.type === "single-choice") {
            value =
                form.querySelector(
                    `input[name="${field.name}"]:checked`
                )?.value || "";
        } else if (field.type === "multi-choice") {
            let selected = Array.from(
                form.querySelectorAll(
                    `input[name="${field.name}"]:checked`
                )
            ).map(cb => cb.value);
            const otherCheckbox = form.querySelector(
                `input[name="${field.name}"].other-option`
            );
            if (otherCheckbox && otherCheckbox.checked) {
                const otherText = otherCheckbox
                    .closest("label")
                    .nextElementSibling.value.trim();
                if (otherText) {
                    selected = selected.filter(v => v !== "Other");
                    selected.push(otherText);
                }
            }
            value = selected.join(", ");
        }
        jsonData[field.name] = value;
    });

    // reformat into the nested object required by back end / user request
    const outputObject = {
        patientId: patientId, // include the patient ID from the earlier fetch
        historyOfPF: {
            responseOfHistory: jsonData.responseOfHistory || "",
            rightFoot: jsonData.rightFoot || "",
            leftFoot: jsonData.leftFoot || "",
            additionalComments: jsonData.historyAdditionalComments || ""
        },
        rightFootConditions: {
            conditions: jsonData.rightConditions || "",
            additionalComments: jsonData.rightConditionsComments || ""
        },
        leftFootConditions: {
            conditions: jsonData.leftConditions || "",
            additionalComments: jsonData.leftConditionsComments || ""
        },
        surgeryRightFoot: {
            surgery: jsonData.surgeryRight || "",
            additionalComments: jsonData.surgeryRightComments || ""
        },
        surgeryLeftFoot: {
            surgery: jsonData.surgeryLeft || "",
            additionalComments: jsonData.surgeryLeftComments || ""
        },
        otherTreatments: {
            treatments: jsonData.treatments || "",
            treatmentsComments: jsonData.treatmentsComments || ""
        },
        otherRelevantComments: jsonData.otherRelevantComments || ""
    };

    //without fetch, just for reference
    // console.log("Patient Medical Info JSON:", outputObject);
    // document.getElementById("output").textContent =
    //     JSON.stringify(outputObject, null, 4);

    // alert("Patient medical information submitted successfully!");
    // window.location.href = "selectPatient.html";


//need to post request the json object to the back end with fetch
fetch("/api/patients/medical-info", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(outputObject)
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Success:", data);
        alert("Patient medical information submitted successfully! Your patient ID is: " + patientId);
        window.location.href = "selectPatient.html";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was an error submitting the information. Please try again.");
    });
});
