CREATE SCHEMA IF NOT EXISTS stretchflex_db;

SET search_path TO stretchflex_db;

---------------------------------------------------
-- PATIENT TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

---------------------------------------------------
-- MEDICAL HISTORY
---------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_history (
    patient_id SERIAL PRIMARY KEY,
    date_of_birth TEXT NOT NULL,
    sex TEXT NOT NULL,
    hieght_m REAL,
    weight_kg REAL,
    BMI REAL,
    history_of_pf TEXT,
    history_of_pf_right_foot TEXT,
    history_of_pf_left_foot TEXT,
    history_of_pf_additional_notes TEXT,
    right_foot_condition TEXT,
    right_foot_condition_additional_notes TEXT,
    left_foot_condition TEXT,
    left_foot_condition_additional_notes TEXT,
    surgery_right_foot TEXT,
    surgery_right_foot_additional_notes TEXT,
    surgery_left_foot TEXT,
    surgery_left_foot_additional_notes TEXT,
    treatments TEXT,
    treatments_comments TEXT,
    treatments_additional_notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

---------------------------------------------------
-- INDEXES
---------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patient_lastname
ON patients(last_name);

CREATE INDEX IF NOT EXISTS idx_patient_firstname
ON patients(first_name);

CREATE INDEX IF NOT EXISTS idx_medical_history_patient
ON medical_history(patient_id);

---------------------------------------------------
-- OPTIONAL DEFAULT DATA
---------------------------------------------------
INSERT INTO patients (first_name, last_name)
VALUES ('Test', 'Patient')
ON CONFLICT DO NOTHING;

INSERT INTO medical_history (patient_id, date_of_birth, sex)
VALUES (1, '2000-01-01', 'Male')
ON CONFLICT DO NOTHING;