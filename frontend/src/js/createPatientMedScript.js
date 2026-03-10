// form builder/validation for medical questionnaire

const patientMedicalInfoFormSchema = [
    // base question with follow‑ups depending on answer
    {
        name: "historyPF",
        label: "Do you have a history of Plantar Fasciitis?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    {
        name: "historyDetailR_yes",
        label: "How long since your diagnosis in your right foot?",
        type: "single-choice",
        options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"],
        dependsOn: { field: "historyPF", value: "Yes" }
    },
    {
        name: "historyDetailL_yes",
        label: "How long since your diagnosis in your left foot?",
        type: "single-choice",
        options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"],
        dependsOn: { field: "historyPF", value: "Yes" }
    },
    {
        name: "historyDetailR_no",
        label: "How long have you experienced pain or discomfort in your right foot?",
        type: "single-choice",
        options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"],
        dependsOn: { field: "historyPF", value: "No" }
    },
    {
        name: "historyDetailL_no",
        label: "How long have you experienced pain or discomfort in your left foot?",
        type: "single-choice",
        options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"],
        dependsOn: { field: "historyPF", value: "No" }
    },
    {
        name: "add",
        label: "Additional Comments",
        type: "string",
        required: false
    },
    {
        name: "conditionsR",
        label: "Have you experienced any of the following conditions to your Right Foot?",
        type: "multi-choice",
        options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "no"],
        allowOther: true,
        required: true
    },
    {
        name: "conditionsL",
        label: "Have you experienced any of the following conditions to your Left Foot?",
        type: "multi-choice",
        options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "no"],
        allowOther: true,
        required: true
    },
    {
        name: "surgeryR",
        label: "Have you previously had surgery to your right leg at or below the knee?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    {
        name: "surgeryL",
        label: "Have you previously had surgery to your left leg at or below the knee?",
        type: "single-choice",
        options: ["Yes", "No"],
        required: true
    },
    {
        name: "homeTreatments",
        label: "Are you currently using any of the following at home treatments?",
        type: "multi-choice",
        options: ["option1", "option2"],
        allowOther: true,
        required: true
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
            lbl.style.display = "inline-block";
            lbl.innerHTML = `<input type="radio" name="${field.name}" value="${opt}"> ${opt}`;
            wrapper.appendChild(lbl);
        });
    } else if (field.type === "multi-choice") {
        wrapper.classList.add("questionSelectAllOtherExclusive");
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            lbl.style.display = "inline-block";
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

    // enforce "no" checkbox exclusivity in multi-choice groups
    if (e.target.type === "checkbox") {
        const name = e.target.name;
        const value = e.target.value.toLowerCase();
        if (value === "no" && e.target.checked) {
            // uncheck every other option in the same group
            form.querySelectorAll(`input[name="${name}"]:not([value="no"])`).forEach(cb => cb.checked = false);
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
            // if any other option is checked, uncheck the no box
            const noBox = form.querySelector(`input[name="${name}"][value="no"]`);
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

    console.log("Patient Medical Info JSON:", jsonData);
    document.getElementById("output").textContent =
        JSON.stringify({ user: jsonData }, null, 4);

    alert("Patient medical information submitted successfully!");
    window.location.href = "selectPatient.html";
});
