const patients = [
    'Patient 1',
    'Patient 2',
    'Patient 3'
];

function populateDatalist(){
    const dl = document.getElementById('patientsList');
    if (!dl) return;
    dl.innerHTML = '';
    patients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        dl.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', populateDatalist);


function verifySelection(){
    const val = document.getElementById('patientInput').value.trim();
    if (!val) {
        alert('Please select or type a patient');
        return;
    }
    // store selection for downstream pages
    sessionStorage.setItem('selectedPatient', val);
    window.location.href = "graphDisplay.html";
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('goButton').addEventListener('click', verifySelection);
    document.getElementById('createButton').addEventListener('click', () => window.location.href='createPatient.html');
    document.getElementById('lookupButton').addEventListener('click', () => window.location.href='lookupPatient.html');
    document.getElementById('editButton').addEventListener('click', () => window.location.href='editPatient.html');
});
