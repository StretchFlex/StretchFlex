using System.Text.Json.Serialization;

public class HistoryOfPF
{
    public string? ResponseOfHistory { get; set; }
    public string? RightFoot { get; set; }
    public string? LeftFoot { get; set; }
    public string? AdditionalComments { get; set; }
}

public class FootConditions
{
    public string? Conditions { get; set; }
    public string? AdditionalComments { get; set; }
}

public class Surgery
{
    [JsonPropertyName("surgery")]
    public string? SurgeryPerformed { get; set; }
    public string? AdditionalComments { get; set; }
}

public class OtherTreatments
{
    public string? Treatments { get; set; }
    [JsonPropertyName("treatmentsComments")]
    public string? TreatmentsComments { get; set; }
}

public class CreateMedicalHistoryDto
{
    public int PatientId { get; set; }
    public HistoryOfPF? HistoryOfPF { get; set; }
    public FootConditions? RightFootConditions { get; set; }
    public FootConditions? LeftFootConditions { get; set; }
    [JsonPropertyName("surgeryRightFoot")]
    public Surgery? SurgeryRight { get; set; }
    [JsonPropertyName("surgeryLeftFoot")]
    public Surgery? SurgeryLeft { get; set; }
    [JsonPropertyName("otherTreatments")]
    public OtherTreatments? Treatments { get; set; }
    public string? OtherRelevantComments { get; set; }
}