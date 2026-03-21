public class PatientMedicalInfoUpdateDto
{
    public HistoryOfPF HistoryOfPF { get; set; } = new();
    public FootConditions RightFootConditions { get; set; } = new();
    public FootConditions LeftFootConditions { get; set; } = new();
    public Surgery SurgeryRight { get; set; } = new();
    public Surgery SurgeryLeft { get; set; } = new();
    public OtherTreatments Treatments { get; set; } = new();
    public string? OtherRelevantComments { get; set; }
}