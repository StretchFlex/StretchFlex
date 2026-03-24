async function populateDatalist(){
    const dl = document.getElementById('patientsList');
    if (!dl) return;
    dl.innerHTML = '';

    try {
        const response = await fetch('/api/patient/list');
        if (!response.ok) throw new Error('Failed to fetch patient list');

        const list = await response.json();
        if (!Array.isArray(list)) throw new Error('Unexpected patients payload');

        list.forEach(p => {
            const opt = document.createElement('option');
            opt.value = `${p.patientId} - ${p.firstName} ${p.lastName}`;
            dl.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading patient list:', error);
        ['Patient 1', 'Patient 2', 'Patient 3'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            dl.appendChild(opt);
        });
    }
}

document.addEventListener('DOMContentLoaded', populateDatalist);


function verifySelection(){
    const val = document.getElementById('patientInput').value.trim();
    if (!val) {
        alert('Please select or type a patient');
        return;
    }

    // The patient selector uses a short label, but for edit/get we need an ID.
    // Try numeric ID first, otherwise parse 'Patient N'.
    let id = null;
    if (/^\d+$/.test(val)) {
        id = parseInt(val, 10);
    } else if (/^Patient\s+(\d+)$/i.test(val)) {
        id = parseInt(val.match(/^Patient\s+(\d+)$/i)[1], 10);
    }

    if (id) {
        sessionStorage.setItem('selectedPatientId', id);
        sessionStorage.setItem('selectedPatient', val);
        window.location.href = "graphDisplay.html";
        return;
    }

    alert('Please enter a valid patient ID or a patient label like "Patient 123".');
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('goButton').addEventListener('click', verifySelection);
    document.getElementById('createButton').addEventListener('click', () => window.location.href='createPatient.html');
    document.getElementById('lookupButton').addEventListener('click', () => window.location.href='lookupPatient.html');
    document.getElementById('editButton').addEventListener('click', () => window.location.href='editPatient.html');
});
