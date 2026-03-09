const medFormSchema = [
    {name: "name", label: "Name", type: "string", required: true},
    {name: "age", label: "Age", type: "integer", required: false},
    {name: "gender", label: "Gender", type: "single-choice", options: ["Male", "Female", "Withheld"]},
    {name: "hobbies", label: "Hobbies", type: "multi-choice", options: ["option1", "option2"], allowOther:true }
];

const form = document.getElementById("userForm");

medFormSchema.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "15px";

    const label = document.createElement("label");
    label.textContent = field.label + ":";
    wrapper.appendChild(label);
    wrapper.appendChild(document.createElement("br"));

    if (field.type === "string" || field.type === "integer") {
        const input = document.createElement("input");
        input.type = field.type === "integer" ? "number" : "text";
        input.name = field.name;
        if(field.type === "integer") {
            input.step = "1";
            input.min = "1";
        }
    wrapper.appendChild(input);    
    }
    else if (field.type === "single-choice"){
        //Radio buttons
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            lbl.innerHTML = <input type="radio" name="${field.name}" value="${opt}"> ${opt};
            wrapper.appendChild(lbl);
        });

    }
    else if (field.type === "multi-choice"){
        //checkboxes
        field.options.forEach(opt => {
            const lbl = document.createElement("label");
            lbl.innerHTML = <input type="checkbox" name="${field.name}" value="Other" class="other-option"> Other;
            wrapper.appendChild(lbl);
        });
            const otherInput = document.createElement("input");
            otherInput.type = "text";
            otherInput.className = "other-text";
            otherInput.placeholder = "Please specify";
            wrapper.appendChild(otherInput);
        }
        
    }
    form.appendChild(wrapper);
});

// Handle showing/hiding "other" text fields dynamically
form.addEventListener("change", function(e){
    if(e.target.classList.contains("other-option")){
        const textField = e.target.closest("label").nextElementSibling;
        if(e.target.checked){
            textField.style.display = "inline-block";
        } else {
            textField.style.display = "none";
            textField.value = "";
        }
    }
});

//Convert form to JSON
document.getElementById("convertBtn").addEventListener("click", 
function() {
    const jsonData = {};
    let valid = true;

    medFormSchema.forEach(field => {
        let value = null;

        if(field.type === "string"){
            value = form.querySelector('[name="${field.name}"]').value.trim();

        }
        else if (field.type === "integer") {
            const raw = form.querySelector('[name="${field.name}"]').value.trim();
            value = raw ? parseInt(raw, 10) : null;
            if (value !== null && (isNaN(value) || value <= 0)) {
                alert('${field.label} must be a positive integer.');
                valid = false;
                return;
            }
        }
        else if (field.type === "single-choice") {
            value = form.querySelector('input[name="${field.name}"]:checked')?.value || "";
        }
        else if (field.type === "multi-choice"){
            let selected = Array.from(form.querySelectorAll('input[name="${field.name}"]:checked')).map(cb => cb.value);

            //Handle "Other"
            const otherCheckbox = form.querySelector('input[name="${field.name}"].other-option');
            if (otherCheckbox && otherCheckbox.checked){
                const otherText = otherCheckbox.closest("label").nextElementSibling.value.trim();
                if (otherText) {
                    selected = selected.filter(v => v !== "Other");
                    selected.push(otherText);
                }
            }
            value = selected.join(", ");
        }
        if (field.required && (!value || value === "")){
            alert('${field.label} is required.');
            valid = false;
            return;
        }

        jsonData[field.name] = value;
});

if(!valid) return;

//Output JSON
document.getElementById("output").textContent = JSON.stringify({user: jsonData }, null, 4);
        });