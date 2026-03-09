public class HistoryOfPF
{
    public string ResponseOfHistory { get; set; }
    public string RightFoot { get; set; }
    public string LeftFoot { get; set; }
    public string AdditionalComments { get; set; }
}

public class FootCondtions
{
    public string Condtions { get; set; }
    public string AddionalComments { get; set; }
}

public class CreateMedicalHistoryDto
{
    public int PatientId { get; set; }
    public HistoryOfPF HistoryOfPF { get; set; }
    public FootCondtions RightFootCondtions { get; set; }
    public FootCondtions LeftFootCondtions { get; set; }
    public string SurgeryRight { get; set; }
    public string SurgeryRightComment { get; set; }
    public string SurgeryLeft { get; set; }
    public string SurgeryLeftComment { get; set; }
    public string Treatments { get; set; }
    public string TreatmentsComments { get; set; }
    public string OtherRelevantComments { get; set; }
}