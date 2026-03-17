public class MedicalHistoryRow
{
    public string? history_of_pf { get; set; }
    public string? history_of_pf_right_foot { get; set; }
    public string? history_of_pf_left_foot { get; set; }
    public string? history_of_pf_additional_notes { get; set; }
    public string? right_foot_condition { get; set; }
    public string? right_foot_condition_additional_notes { get; set; }
    public string? left_foot_condition { get; set; }
    public string? left_foot_condition_additional_notes { get; set; }
    public string? surgery_right_foot { get; set; }
    public string? surgery_right_foot_additional_notes { get; set; }
    public string? surgery_left_foot { get; set; }
    public string? surgery_left_foot_additional_notes { get; set; }
    public string? treatments { get; set; }
    public string? treatments_comments { get; set; }
    public string? other_relevant_comments { get; set; }
}

// Response DTO — mirrors the shape of CreateMedicalHistoryDto for consistency
public class PatientMedicalInfoResponseDto
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