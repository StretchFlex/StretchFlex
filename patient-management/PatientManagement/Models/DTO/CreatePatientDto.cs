public class CreatePatientDto
{
    public string? firstName { get; set; }
    public string? lastName { get; set; }
    public string? email { get; set; }
    public string? dateOfBirth { get; set; }
    public string? sex { get; set; }
    public float? height { get; set; }
    public float? mass { get; set; }
    public float? bmi { get; set; }
}

public class PatientResponse
{
    public int PatientId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Email { get; set; }
}