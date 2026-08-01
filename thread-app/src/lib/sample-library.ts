import type { ZoneId } from "./timeline";

export type SampleLibraryDoc = {
  id: string;
  filename: string;
  trimester: ZoneId;
  title: string;
  /** Omitted when the source document doesn't state a date. */
  date?: string;
  provider: string;
  summary: string;
};

/** Hardcoded reference library covering all 12 CareOS sample PDFs across all 4 stages. */
export const SAMPLE_LIBRARY_DOCS: SampleLibraryDoc[] = [
  {
    id: "1",
    filename: "CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf",
    trimester: "first",
    title: "Maternal Baseline Intake Form",
    date: "2026-07-08",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "First-trimester intake: LMP-based EDD 02/14/2027, blood type O Negative (Rh-negative) flagged for RhoGAM protocol, mild asthma and controlled hypothyroidism noted.",
  },
  {
    id: "2",
    filename: "CareOS_Template_2_First_Trimester_Lab_Panel_Report.pdf",
    trimester: "first",
    title: "First Trimester Lab Panel Report",
    date: "2026-07-11",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "hCG and progesterone normal; mild anemia flagged (Hgb 11.2 g/dL); infectious disease and immunity screen all normal.",
  },
  {
    id: "3",
    filename: "CareOS_Template_3_Early_Dating_Ultrasound_Report.pdf",
    trimester: "first",
    title: "Early Dating Ultrasound Report",
    date: "2026-07-12",
    provider: "Dr. Amanda Ross, MD · Radiology",
    summary:
      "Single live intrauterine pregnancy confirmed at 8w5d by CRL, FHR 168 bpm, revised EDD 02/13/2027.",
  },
  {
    id: "4",
    filename: "CareOS_Template_4_NIPT_Genetic_Screening_Report.pdf",
    trimester: "second",
    title: "NIPT Genetic Screening Report",
    date: "2026-08-21",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "Low risk across all screened aneuploidies (Trisomy 21/18/13, Monosomy X); fetal sex predicted female.",
  },
  {
    id: "5",
    filename: "CareOS_Template_5_20_Week_Anatomy_Scan_Report.pdf",
    trimester: "second",
    title: "20-Week Fetal Anatomy Survey",
    date: "2026-09-28",
    provider: "Dr. Amanda Ross, MD · Radiology",
    summary:
      "Normal fetal biometry at 20w1d (50th percentile); complete anatomy survey within normal limits; anterior high-lying placenta without previa.",
  },
  {
    id: "6",
    filename: "CareOS_Template_6_Glucose_Tolerance_Test_Report.pdf",
    trimester: "second",
    title: "Glucose Tolerance Test (OGTT) Report",
    date: "2026-10-24",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "1-hour glucose challenge abnormal (152 mg/dL); confirmatory 3-hour OGTT met gestational diabetes criteria (3 of 4 values elevated); nutrition referral added.",
  },
  {
    id: "7",
    filename: "CareOS_Template_7_Prior_Authorization_Breast_Pump_Order.pdf",
    trimester: "third",
    title: "Breast Pump Prior Authorization",
    date: "2026-11-07",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "Double electric breast pump (Spectra S1 Plus) prescribed and approved 100% in-network via Aetna; scheduled for shipment at week 30.",
  },
  {
    id: "8",
    filename: "CareOS_Template_8_Custom_Birth_Plan.pdf",
    trimester: "third",
    title: "Custom Birth Plan",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "Labor environment, pain management, delivery, and emergency C-section preferences, including delayed cord clamping and skin-to-skin contact.",
  },
  {
    id: "9",
    filename: "CareOS_Template_9_Hospital_Admission_Checklist_Directory.pdf",
    trimester: "third",
    title: "Hospital Admission Checklist & Directory",
    provider: "NYU Langone Tisch Hospital · Labor & Delivery",
    summary:
      "Pre-registration confirmed; emergency contacts, pediatrician, and hospital bag / admin document checklist all complete.",
  },
  {
    id: "10",
    filename: "CareOS_Template_10_Postpartum_Health_Edinburgh_Scale_Log.pdf",
    trimester: "postpartum",
    title: "Postpartum Health & Edinburgh Scale Log",
    date: "2027-02-27",
    provider: "Dr. Sarah Jenkins, MD · OB/GYN",
    summary:
      "Day 14 postpartum recovery check; EPDS score 13/30 (moderate elevation) triggered an automated wellness/support-resource prompt.",
  },
  {
    id: "11",
    filename: "CareOS_Template_11_Lactation_Feeding_Diaper_Log.pdf",
    trimester: "postpartum",
    title: "Lactation & Newborn Feeding Log",
    date: "2027-02-27",
    provider: "Dr. Michael Chen, MD · Pediatrics",
    summary:
      "Day 14 feeding and diaper output log — nursing, expressed milk, and formula feeds; wet diaper and stool counts both within optimal range.",
  },
  {
    id: "12",
    filename: "CareOS_Template_12_6_Week_Postpartum_Pediatric_Summary.pdf",
    trimester: "postpartum",
    title: "6-Week Postpartum & Pediatric Summary",
    date: "2027-03-28",
    provider: "Dr. Sarah Jenkins, MD & Dr. Michael Chen, MD",
    summary:
      "Mother cleared for full activity, EPDS improved to 7/30; newborn growth on 50–55th percentiles with first round of immunizations administered.",
  },
];
