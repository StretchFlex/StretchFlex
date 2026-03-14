CREATE SCHEMA IF NOT EXISTS stretchflex_db;

CREATE TABLE IF NOT EXISTS stretchflex_db.patients (
    patient_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE OR REPLACE FUNCTION stretchflex_db.generate_patient_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id INTEGER;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        new_id := floor(random() * 9000 + 1000)::INTEGER;
        done := NOT EXISTS (
            SELECT 1 FROM stretchflex_db.patients WHERE patient_id = new_id
        );
    END LOOP;
    NEW.patient_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_patient_id
BEFORE INSERT ON stretchflex_db.patients
FOR EACH ROW
WHEN (NEW.patient_id IS NULL)
EXECUTE FUNCTION stretchflex_db.generate_patient_id();

CREATE TABLE IF NOT EXISTS stretchflex_db.medical_history (
    patient_id INTEGER PRIMARY KEY,
    date_of_birth TEXT NOT NULL,
    sex TEXT NOT NULL,
    height_m REAL,
    weight_kg REAL,
    bmi REAL,
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
    other_relevant_comments TEXT,
    FOREIGN KEY (patient_id) REFERENCES stretchflex_db.patients(patient_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_lastname
    ON stretchflex_db.patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patient_firstname
    ON stretchflex_db.patients(first_name);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient
    ON stretchflex_db.medical_history(patient_id);

INSERT INTO stretchflex_db.patients (first_name, last_name, email)
VALUES ('Test', 'Patient', 'test.patient@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO stretchflex_db.medical_history (patient_id, date_of_birth, sex)
SELECT patient_id, '2000-01-01', 'Male'
FROM stretchflex_db.patients
WHERE email = 'test.patient@example.com'
ON CONFLICT DO NOTHING;