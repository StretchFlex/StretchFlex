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
            opt.value = `${p.patientId}`;
            dl.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading patient list:', error);
        ['1', '2', '3'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            dl.appendChild(opt);
        });
    }
}

async function populateEditDropdown(){
    const listNode = document.getElementById('editPatientsList');
    if (!listNode) return;
    listNode.innerHTML = '';

    try {
        const response = await fetch('/api/patient/list');
        if (!response.ok) throw new Error('Failed to fetch patient list');
        const list = await response.json();

        if (!Array.isArray(list)) throw new Error('Unexpected patients payload');

        list.forEach(p => {
            const option = document.createElement('option');
            option.value = `${p.patientId}`;
            listNode.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading edit patient list:', error);
        ['1','2','3'].forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            listNode.appendChild(option);
        });
    }
}

function verifySelection(){
    const val = document.getElementById('patientInput').value.trim();
    if (!val) {
        alert('Please select or type a patient');
        return;
    }

    let id = null;
    const numericMatch = val.match(/^\s*(\d+)\s*(?:-|$)/);
    if (numericMatch) {
        id = parseInt(numericMatch[1], 10);
    } else if (/^\d+$/.test(val)) {
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

function editSelectedPatient(){
    const input = document.getElementById('editPatientInput');
    if (!input) return;

    const val = input.value.trim();
    if (!val) {
        alert('Please select a patient to edit.');
        return;
    }

    let id = null;
    const numericMatch = val.match(/^\s*(\d+)\s*(?:-|$)/);
    if (numericMatch) {
        id = parseInt(numericMatch[1], 10);
    } else if (/^\d+$/.test(val)) {
        id = parseInt(val, 10);
    } else if (/^Patient\s+(\d+)$/i.test(val)) {
        id = parseInt(val.match(/^Patient\s+(\d+)$/i)[1], 10);
    }

    if (!id) {
        alert('Please choose a valid patient entry from the list.');
        return;
    }

    sessionStorage.setItem('selectedPatientId', id);
    sessionStorage.setItem('selectedPatient', val);
    window.location.href = `editPatient.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', function() {
    populateEditDropdown();
    populateDatalist();

    document.getElementById('goButton').addEventListener('click', verifySelection);
    document.getElementById('createButton').addEventListener('click', () => window.location.href='createPatient.html');
    document.getElementById('lookupButton').addEventListener('click', () => window.location.href='lookupPatient.html');
    document.getElementById('editButton').addEventListener('click', editSelectedPatient);
});
