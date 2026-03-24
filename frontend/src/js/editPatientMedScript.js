// editPatientMedScript.js
// Autofill form with existing patient medical information and perform PUT update when submitted.

let patientId = null;
function loadSelectedPatientId() {
    const stored = sessionStorage.getItem('selectedPatientId');
    if (stored && !isNaN(parseInt(stored, 10))) {
        patientId = parseInt(stored, 10);
    } else {
        const query = new URLSearchParams(window.location.search);
        const qid = query.get('id');
        if (qid && !isNaN(parseInt(qid, 10))) {
            patientId = parseInt(qid, 10);
        }
    }
}
loadSelectedPatientId();

const patientMedicalInfoFormSchema = [
    { name: "patientId", label: "Patient ID", type: "string", required: false, readOnly: true },
    { name: "responseOfHistory", label: "Do you have a history of Plantar Fasciitis?", type: "single-choice", options: ["Yes", "No"], required: true },
    { name: "rightFoot", label: "How long since your diagnosis in your right foot?", type: "single-choice", options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"], dependsOn: { field: "responseOfHistory", value: "Yes" } },
    { name: "leftFoot", label: "How long since your diagnosis in your left foot?", type: "single-choice", options: ["0-1 years", "2-3 years", "4-5 years", "6+ years", "N/A"], dependsOn: { field: "responseOfHistory", value: "Yes" } },
    { name: "rightFoot", label: "How long have you experienced pain or discomfort in your right foot?", type: "single-choice", options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"], dependsOn: { field: "responseOfHistory", value: "No" } },
    { name: "leftFoot", label: "How long have you experienced pain or discomfort in your left foot?", type: "single-choice", options: ["0-1 months", "2-3 months", "4-5 months", "6+ months", "N/A"], dependsOn: { field: "responseOfHistory", value: "No" } },
    { name: "historyAdditionalComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "rightConditions", label: "Have you experienced any of the following conditions to your Right Foot?", type: "multi-choice", options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "No"], allowOther: true, required: true },
    { name: "rightConditionsComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "leftConditions", label: "Have you experienced any of the following conditions to your Left Foot?", type: "multi-choice", options: ["Sprain", "Fracture or Break", "Arthritis", "Achilles Tendon Injury", "No"], allowOther: true, required: true },
    { name: "leftConditionsComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "surgeryRight", label: "Have you previously had surgery to your right leg at or below the knee?", type: "single-choice", options: ["Yes", "No"], required: true },
    { name: "surgeryRightComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "surgeryLeft", label: "Have you previously had surgery to your left leg at or below the knee?", type: "single-choice", options: ["Yes", "No"], required: true },
    { name: "surgeryLeftComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "treatments", label: "Are you currently using any of the following at home treatments?", type: "multi-choice", options: ["Rest", "Stretch", "Ice", "Compression", "Elevation", "Brace", "Insole", "Medication", "No"], required: true },
    { name: "treatmentsComments", label: "Additional Comments", type: "string", required: false, maxLength: 550 },
    { name: "otherRelevantComments", label: "Do you have any other relevant conditions to report?", type: "string", required: false, maxLength: 550 }
];

const form = document.getElementById("patientMedicalInfoForm");

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
        if (field.readOnly) {
            input.readOnly = true;
            input.style.backgroundColor = "#f3f3f3";
        }
        wrapper.appendChild(input);
    } else if (field.type === "single-choice") {
        wrapper.classList.add("questionSelectOne");
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            lbl.innerHTML = `<input type="radio" name="${field.name}" value="${opt}"> ${opt}`;
            wrapper.appendChild(lbl);
        });
    } else if (field.type === "multi-choice") {
        wrapper.classList.add("questionSelectAllOtherExclusive");
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
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

function refreshDependencies() {
    patientMedicalInfoFormSchema.forEach(field => {
        if (!field.dependsOn) return;
        const wrappers = form.querySelectorAll(`div[data-depends-field="${field.dependsOn.field}"][data-depends-value="${field.dependsOn.value}"]`);
        const controllerValue = form.querySelector(`[name="${field.dependsOn.field}"]:checked`)?.value;
        wrappers.forEach(wrapper => {
            if (controllerValue === field.dependsOn.value) {
                wrapper.classList.remove("hidden-question");
            } else {
                wrapper.classList.add("hidden-question");
                wrapper.querySelectorAll("input").forEach(i => {
                    if (i.type === "radio" || i.type === "checkbox") i.checked = false;
                    else i.value = "";
                });
            }
        });
    });
}

form.addEventListener("change", function (e) {
    if (e.target.classList.contains("other-option")) {
        const textField = e.target.closest("label").nextElementSibling;
        if (textField) {
            textField.style.display = e.target.checked ? "inline-block" : "none";
            if (!e.target.checked) textField.value = "";
        }
    }
    if (e.target.type === "checkbox") {
        const name = e.target.name;
        const value = e.target.value.toLowerCase();
        if (value === "no" && e.target.checked) {
            form.querySelectorAll(`input[name="${name}"]:not([value="No"])`).forEach(cb => cb.checked = false);
            form.querySelectorAll(`input[name="${name}"].other-option`).forEach(otherCb => {
                const textField = otherCb.closest("label").nextElementSibling;
                if (textField) {
                    textField.style.display = "none";
                    textField.value = "";
                    otherCb.checked = false;
                }
            });
        } else if (e.target.checked) {
            const noBox = form.querySelector(`input[name="${name}"][value="No"]`);
            if (noBox) noBox.checked = false;
        }
    }
    refreshDependencies();
});

function verifyFieldsMed() {
    const questionBlocks = document.querySelectorAll(".questionSelectOne, .questionSelectAllOtherExclusive");
    for (const block of questionBlocks) {
        if (block.closest(".hidden-question") || block.offsetParent === null) continue;
        const inputs = block.querySelectorAll("input[type=checkbox], input[type=radio]");
        if (inputs.length === 0) continue;
        if (!Array.from(inputs).some(i => i.checked)) {
            const questionLabel = block.querySelector('label')?.textContent || 'this question';
            alert(`Please answer: ${questionLabel}`);
            if (inputs.length > 0) inputs[0].focus();
            return false;
        }
    }
    return true;
}

function setFieldValue(fieldName, value) {
    const element = form.querySelector(`[name="${fieldName}"]`);
    if (fieldName === 'patientId' && element) {
        element.value = value;
        return;
    }
    if (!element) {
        // for multi-choice and special cases
        if (['rightConditions', 'leftConditions', 'treatments'].includes(fieldName)) {
            const values = (value || '').split(',').map(v => v.trim()).filter(Boolean);
            form.querySelectorAll(`input[name="${fieldName}"]`).forEach(cb => {
                if (values.includes(cb.value)) {
                    cb.checked = true;
                    if (cb.value === 'Other') {
                        const otherInput = cb.closest('label')?.nextElementSibling;
                        if (otherInput) {
                            otherInput.style.display = 'inline-block';
                            otherInput.value = values.filter(v => v !== 'Other').join(', ');
                        }
                    }
                }
            });
        }
        return;
    }

    if (element.type === 'radio') {
        const option = form.querySelector(`input[name="${fieldName}"][value="${value}"]`);
        if (option) option.checked = true;
        return;
    }

    element.value = value || "";
}

function fillFormFromApi(data) {
    setFieldValue('patientId', patientId);
    setFieldValue('responseOfHistory', data.historyOfPF?.responseOfHistory);
    setFieldValue('rightFoot', data.historyOfPF?.rightFoot);
    setFieldValue('leftFoot', data.historyOfPF?.leftFoot);
    setFieldValue('historyAdditionalComments', data.historyOfPF?.additionalComments);
    setFieldValue('rightConditions', data.rightFootConditions?.conditions);
    setFieldValue('rightConditionsComments', data.rightFootConditions?.additionalComments);
    setFieldValue('leftConditions', data.leftFootConditions?.conditions);
    setFieldValue('leftConditionsComments', data.leftFootConditions?.additionalComments);
    setFieldValue('surgeryRight', data.surgeryRight?.surgeryPerformed);
    setFieldValue('surgeryRightComments', data.surgeryRight?.additionalComments);
    setFieldValue('surgeryLeft', data.surgeryLeft?.surgeryPerformed);
    setFieldValue('surgeryLeftComments', data.surgeryLeft?.additionalComments);
    setFieldValue('treatments', data.treatments?.treatments);
    setFieldValue('treatmentsComments', data.treatments?.treatmentsComments);
    setFieldValue('otherRelevantComments', data.otherRelevantComments);
    refreshDependencies();
}

function loadExistingMedicalInfo() {
    if (!patientId) {
        alert('Patient ID missing. Please select a patient.');
        window.location.href = 'selectPatient.html';
        return;
    }

    fetch(`/api/patient/medical-history/${patientId}`)
        .then(resp => {
            if (!resp.ok) throw new Error('Failed to fetch medical history');
            return resp.json();
        })
        .then(data => fillFormFromApi(data))
        .catch(error => {
            console.error('Error loading medical history:', error);
            alert('Unable to load medical history for this patient.');
        });
}

function collectMedicalFormData() {
    const out = {
        historyOfPF: {
            responseOfHistory: form.querySelector('input[name="responseOfHistory"]:checked')?.value || '',
            rightFoot: form.querySelector('input[name="rightFoot"]:checked')?.value || '',
            leftFoot: form.querySelector('input[name="leftFoot"]:checked')?.value || '',
            additionalComments: form.querySelector('[name="historyAdditionalComments"]')?.value.trim() || ''
        },
        rightFootConditions: {
            conditions: Array.from(form.querySelectorAll('input[name="rightConditions"]:checked')).map(cb => cb.value).join(', '),
            additionalComments: form.querySelector('[name="rightConditionsComments"]')?.value.trim() || ''
        },
        leftFootConditions: {
            conditions: Array.from(form.querySelectorAll('input[name="leftConditions"]:checked')).map(cb => cb.value).join(', '),
            additionalComments: form.querySelector('[name="leftConditionsComments"]')?.value.trim() || ''
        },
        surgeryRight: {
            surgeryPerformed: form.querySelector('input[name="surgeryRight"]:checked')?.value || '',
            additionalComments: form.querySelector('[name="surgeryRightComments"]')?.value.trim() || ''
        },
        surgeryLeft: {
            surgeryPerformed: form.querySelector('input[name="surgeryLeft"]:checked')?.value || '',
            additionalComments: form.querySelector('[name="surgeryLeftComments"]')?.value.trim() || ''
        },
        treatments: {
            treatments: Array.from(form.querySelectorAll('input[name="treatments"]:checked')).map(cb => cb.value).join(', '),
            treatmentsComments: form.querySelector('[name="treatmentsComments"]')?.value.trim() || ''
        },
        otherRelevantComments: form.querySelector('[name="otherRelevantComments"]')?.value.trim() || ''
    };

    return out;
}

// function submitMedicalUpdate() {
//     if (!patientId) {
//         alert('Patient ID missing.');
//         return;
//     }

//     if (!verifyFieldsMed()) return;

//     const payload = collectMedicalFormData();

//     fetch(`/api/patient/update/medical-history/${patientId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//     })
//         .then(resp => {
//             if (!resp.ok) throw new Error('Network response was not ok');
//             return resp;
//         })
//         .then(() => {
//             alert('Patient medical history updated successfully.');
//             window.location.href = 'selectPatient.html';
//         })
//         .catch(error => {
//             console.error('Error updating medical history:', error);
//             alert('Unable to update medical history; please try again.');
//         });
// }

async function submitMedicalUpdate() {
    if (!patientId) {
        alert('Patient ID missing.');
        return;
    }

    if (!verifyFieldsMed()) return;

    const payload = collectMedicalFormData();

    try {
        const resp = await fetch(`/api/patient/update/medical-history/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }

        alert('Patient medical history updated successfully.');
        window.location.href = 'selectPatient.html';

    } catch (error) {
        console.error('Error updating medical history:', error);
        alert('Unable to update medical history; please try again.');
    }
}


function buildForm() {
    patientMedicalInfoFormSchema.forEach(field => form.appendChild(createQuestion(field)));
    refreshDependencies();
}

window.addEventListener('DOMContentLoaded', () => {
    buildForm();
    loadExistingMedicalInfo();
    document.getElementById('updateMedicalBtn').addEventListener('click', submitMedicalUpdate);
}); 