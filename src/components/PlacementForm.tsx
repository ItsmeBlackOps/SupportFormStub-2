import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FormSection } from "./FormSection";
import type { PlacementFormData } from "../types";
import { useToast } from "../hooks/useToast";


const fieldLabels: Record<string, string> = {
  id: "ID",
  candidateName: "Name of Candidate",
  sstVivza: "SST/Vivza",
  location: "Location",
  poCountTotal: "PO Count Total",
  poCountAMD: "PO Count AMD",
  poCountGGR: "PO Count GGR",
  poCountLKO: "PO Count LKO",
  placementOfferID: "Placement Offer ID",
  personalPhone: "Personal Phone Number",
  email: "Email ID",
  fullAddress: "Full Address",
  jobType: "Type of Job (W2 / C2C / FTE)",
  positionApplied: "Position that Applied",
  jobLocation: "Job Location",
  endClient: "Implementation/End Client",
  vendorName: "Vendor Name",
  vendorTitle: "Vendor Title",
  vendorDirect: "Vendor Direct",
  vendorEmail: "Vendor Email",
  rate: "Rate",
  signupDate: "Signup Date",
  training: "Training Yes/No",
  trainingDoneDate: "When Training Done",
  joiningDate: "Joining Date",
  marketingStart: "Marketing Start Date",
  marketingEnd: "Marketing End Date",
  salesLeadBy: "Sales Lead By",
  salesPerson: "Sales Person",
  salesTeamLead: "Sales Team Lead",
  salesManager: "Sales Manager",
  supportBy: "Support By",
  interviewTeamLead: "Interview Team Lead",
  interviewManager: "Interview Manager",
  applicationBy: "Application By",
  recruiterName: "Recruiter Name",
  marketingTeamLead: "Marketing Team Lead",
  marketingManager: "Marketing Manager",
  agreementPercent: "Agreement Percent",
  agreementMonths: "Agreement Months",
  remarks: "Remarks",
};

const groupedSections: {
  heading: string;
  fields: { label: string; key: keyof PlacementFormData }[];
}[] = [
  {
    heading: "PO Count",
    fields: [
      { label: "Total", key: "poCountTotal" },
      { label: "AMD", key: "poCountAMD" },
      { label: "GGR", key: "poCountGGR" },
      { label: "LKO", key: "poCountLKO" },
    ],
  },
  {
    heading: "Vendor Details",
    fields: [
      { label: "Name", key: "vendorName" },
      { label: "Title", key: "vendorTitle" },
      { label: "Direct", key: "vendorDirect" },
      { label: "Email", key: "vendorEmail" },
    ],
  },
  {
    heading: "Sales",
    fields: [
      { label: "Lead By", key: "salesLeadBy" },
      { label: "Sales Person", key: "salesPerson" },
      { label: "Team Lead", key: "salesTeamLead" },
      { label: "Manager", key: "salesManager" },
    ],
  },
  {
    heading: "Interview Support",
    fields: [
      { label: "Support By", key: "supportBy" },
      { label: "Team Lead", key: "interviewTeamLead" },
      { label: "Manager", key: "interviewManager" },
    ],
  },
  {
    heading: "Marketing",
    fields: [
      { label: "Application By", key: "applicationBy" },
      { label: "Recruiter Name", key: "recruiterName" },
      { label: "Team Lead", key: "marketingTeamLead" },
      { label: "Manager", key: "marketingManager" },
    ],
  },
];

const PlacementForm: React.FC = () => {
  const initialState: PlacementFormData = {
    id: "",
    candidateName: "",
    sstVivza: "",
    location: "",
    poCountTotal: 0,
    poCountAMD: "",
    poCountGGR: "",
    poCountLKO: "",
    placementOfferID: "",
    personalPhone: "",
    email: "",
    fullAddress: "",
    jobType: "W2",
    positionApplied: "",
    jobLocation: "",
    endClient: "",
    vendorName: "",
    vendorTitle: "",
    vendorDirect: "",
    vendorEmail: "",
    rate: "",
    signupDate: "",
    training: "",
    trainingDoneDate: "",
    joiningDate: "",
    marketingStart: "",
    marketingEnd: "",
    salesLeadBy: "",
    salesPerson: "",
    salesTeamLead: "",
    salesManager: "",
    supportBy: "",
    interviewTeamLead: "",
    interviewManager: "",
    applicationBy: "",
    recruiterName: "",
    marketingTeamLead: "",
    marketingManager: "",
    agreementPercent: "",
    agreementMonths: "",
    remarks: "",
  };

  const [data, setData] = useState<PlacementFormData>({ ...initialState });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [submittedData, setSubmittedData] = useState<PlacementFormData | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const { showToast, ToastContainer } = useToast();

  const generatePlacementOfferId = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const seq = crypto.randomUUID().split("-")[0];
    return `PO-${yyyy}${mm}${dd}-${seq}`;
  };

  useEffect(() => {
    const id = generatePlacementOfferId();
    setData((d) => ({ ...d, placementOfferID: id, id }));
  }, []);

  const formatCandidateName = (value: string) =>
    value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const validateField = (name: string, value: string | number): string => {
    let error = "";
    if (name === "candidateName" && typeof value === "string" && !value.trim())
      error = "Name is required.";
    if (name === "sstVivza" && typeof value === "string" && !value)
      error = "Please select SST or Vivza.";
    if (name === "location" && typeof value === "string" && !value)
      error = "Please select a location.";
    if (["poCountAMD", "poCountGGR", "poCountLKO"].includes(name) && value !== "" && Number(value) < 0)
      error = "PO count cannot be negative.";
    if (name === "personalPhone" && typeof value === "string") {
      if (value && (!/^\d*$/.test(value) || value.length > 10)) {
        error = "Phone must be numeric and max 10 digits.";
      } else if (value.length > 0 && value.length < 10) {
        error = "Phone number must be 10 digits.";
      }
    }
    if (name === "email" && typeof value === "string" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid email format.";
    if (name === "vendorEmail" && typeof value === "string" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid vendor email format.";
    if (name === "rate" && value !== "" && (Number.isNaN(Number(value)) || Number(value) < 0))
      error = "Rate must be a non-negative number.";
    if (name === "agreementPercent" && value !== "" && (Number(value) < 0 || Number(value) > 100))
      error = "Agreement % must be between 0 and 100.";
    if (name === "agreementMonths" && value !== "" && Number(value) < 0)
      error = "Agreement months must be non-negative.";
    return error;
  };

  const numericFields: (keyof PlacementFormData)[] = [
    "poCountAMD",
    "poCountGGR",
    "poCountLKO",
    "rate",
    "agreementPercent",
    "agreementMonths",
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof PlacementFormData;
    const formattedValue =
      key === "candidateName"
        ? formatCandidateName(value)
        : numericFields.includes(key)
        ? (value === "" ? "" : Number(value))
        : value;

    setData((prev) => {
      const updated = { ...prev, [key]: formattedValue } as PlacementFormData;
      const amd = Number(updated.poCountAMD || 0);
      const ggr = Number(updated.poCountGGR || 0);
      const lko = Number(updated.poCountLKO || 0);
      updated.poCountTotal = amd + ggr + lko;
      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: validateField(name, formattedValue) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    Object.keys(data).forEach((field) => {
      const key = field as keyof PlacementFormData;
      const error = validateField(field, data[key]);
      if (error) newErrors[field] = error;
    });

    const today = new Date().toISOString().split("T")[0];
    if (data.joiningDate && data.joiningDate < today) {
      newErrors.joiningDate = "Joining date cannot be in the past.";
    }
    if (data.trainingDoneDate && data.trainingDoneDate > today) {
      newErrors.trainingDoneDate = "Training done date cannot be in the future.";
    }
    if (data.signupDate && data.joiningDate && data.signupDate > data.joiningDate) {
      newErrors.signupDate = "Signup date cannot be after joining date.";
    }
    if (data.marketingStart && data.marketingEnd && data.marketingEnd < data.marketingStart) {
      newErrors.marketingEnd = "Marketing end date cannot be before start date.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmittedData(data);
      setShowPopup(true);
      localStorage.setItem("placementOfferForm", JSON.stringify(data));
      const id = generatePlacementOfferId();
      setData({ ...initialState, placementOfferID: id, id });
      setErrors({});
    }
  };

  const copyTable = async () => {
    const table = tableRef.current;
    if (!table) {
      showToast("Table not found", "error");
      return;
    }

    const excludeLabels = new Set(['Placement Offer ID', 'ID']);

    // Get plain text version
    const rows = Array.from(table.querySelectorAll('tr')).filter(
      (row) => !excludeLabels.has(row.cells[0]?.textContent?.trim() || '')
    );
    const text = rows
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => {
            const spans = cell.querySelectorAll('span');
            if (spans.length > 0) {
              return Array.from(spans)
                .map((s) => s.textContent?.trim() || '')
                .join('\n');
            }
            return cell.textContent?.trim() || '';
          })
          .join('\t')
      )
      .join('\n');

    // Clone and strip styles/classes
    const clone = table.cloneNode(true) as HTMLTableElement;
    clone.querySelectorAll('tr').forEach((row) => {
      const label = (row as HTMLTableRowElement).cells[0]?.textContent?.trim();
      if (excludeLabels.has(label || '')) {
        row.remove();
      }
    });
    clone.querySelectorAll('*').forEach((el) => {
      (el as HTMLElement).removeAttribute('class');
      (el as HTMLElement).removeAttribute('style');
    });

    // Ensure stacked entries remain separated when pasted
    clone.querySelectorAll('td').forEach((cell) => {
      const spans = cell.querySelectorAll('span');
      if (spans.length > 0) {
        const lines = Array.from(spans)
          .map((s) => s.textContent?.trim() || '')
          .join('<br>');
        cell.innerHTML = lines;
      }
    });

    // Wrap in a full HTML document structure
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            ${clone.innerHTML
              .replace(/<td>/g, '<td style="border: 1px solid #000; padding: 4px;">')
              .replace(/<th>/g, '<th style="border: 1px solid #000; padding: 4px; background: #eee;">')}
          </table>
        </body>
      </html>
    `;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
        }),
      ]);
      showToast('Table copied! You can paste it into Word or Google Docs.', 'success');
    } catch (err) {
      showToast('Failed to copy table: ' + (err as Error).message, 'error');
    }
  };


  const downloadPDF = () => {
    if (!submittedData) return;
    const doc = new jsPDF();
    doc.text(submittedData.candidateName || "Submitted Data", 14, 15);

    const excludeKeys = new Set(["placementOfferID", "id"]);
    const tableData = Object.entries(submittedData)
      .filter(([key]) => !excludeKeys.has(key))
      .map(([key, value]) => [fieldLabels[key] || key, value || "N/A"]);

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: tableData,
      startY: 20,
    });
    doc.save(`${submittedData.candidateName || "Submitted_Data"}.pdf`);
  };

  // Custom input renderer
  const renderInput = (
    label: string,
    name: keyof PlacementFormData,
    type = "text",
    isTextArea = false,
    options?: string[],
    readOnly = false,
    extraClass = ""
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">{label}</label>
      {options ? (
        <select
          name={name}
          value={data[name]}
          onChange={handleChange}
          disabled={readOnly}
          className={`block w-full rounded-lg border-0 px-3 py-2 text-sm text-white bg-gray-800 shadow-sm ring-1 ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${readOnly ? "bg-gray-700 cursor-not-allowed ring-gray-700" : ""} ${extraClass}`}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : isTextArea ? (
        <textarea
          name={name}
          value={data[name]}
          onChange={handleChange}
          readOnly={readOnly}
          className={`block w-full rounded-lg border-0 px-3 py-2 text-sm text-white bg-gray-800 shadow-sm ring-1 ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${readOnly ? "bg-gray-700 cursor-not-allowed ring-gray-700" : ""} ${extraClass}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={data[name]}
          onChange={handleChange}
          readOnly={readOnly}
          className={`block w-full rounded-lg border-0 px-3 py-2 text-sm text-white bg-gray-800 shadow-sm ring-1 ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${readOnly ? "bg-gray-700 cursor-not-allowed ring-gray-700" : ""} ${extraClass}`}
        />
      )}
      {errors[name] && <span className="text-red-400 text-xs">{errors[name]}</span>}
    </div>
  );

  const sectionsByHeading = Object.fromEntries(
    groupedSections.map((section) => [section.heading, section])
  );

  const tableOrder: (
    | keyof PlacementFormData
    | { group: string }
    | { combined: (keyof PlacementFormData)[]; label: string }
  )[] = [
    "candidateName",
    "sstVivza",
    "location",
    { group: "PO Count" },
    "personalPhone",
    "email",
    "fullAddress",
    "jobType",
    "positionApplied",
    "jobLocation",
    "endClient",
    { group: "Vendor Details" },
    "rate",
    "signupDate",
    "training",
    "trainingDoneDate",
    { group: "Sales" },
    { group: "Interview Support" },
    { group: "Marketing" },
    "marketingStart",
    "marketingEnd",
    "joiningDate",
    { combined: ["agreementPercent", "agreementMonths"], label: "Agreement Percentage and Months" },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-gray-900 shadow-sm border border-gray-700/60 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg px-6 py-4 border-b border-purple-500/20">
        <h1 className="text-lg font-semibold text-white">Placement Offer Submission Form</h1>
      </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-8">
          {/* Candidate */}
          <FormSection title="Candidate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("Name of candidate", "candidateName")}
              {renderInput("SST/Vivza", "sstVivza", "text", false, ["SST", "Vivza"])}
              {renderInput("Location", "location", "text", false, [
                "Gurgaon",
                "Ahmedabad",
                "Lucknow",
              ])}
            </div>
          </FormSection>

          {/* PO Details */}
          <FormSection title="PO Details">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {renderInput("Total PO Count", "poCountTotal", "number", false, undefined, true)}
              {renderInput("AMD", "poCountAMD", "number", false, undefined, false, "no-spinner")}
              {renderInput("GGR", "poCountGGR", "number", false, undefined, false, "no-spinner")}
              {renderInput("LKO", "poCountLKO", "number", false, undefined, false, "no-spinner")}
              {renderInput("Placement Offer ID", "placementOfferID", "text", false, undefined, true)}
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection title="Contact">
            {renderInput("Personal phone number", "personalPhone")}
            {renderInput("Email ID", "email")}
            {renderInput("Full Address", "fullAddress", "text", true)}
          </FormSection>

          {/* Position */}
          <FormSection title="Position">
            {renderInput("Type of Job", "jobType", "text", false, ["W2", "C2C", "FTE"])}
            {renderInput("Position Applied", "positionApplied")}
            {renderInput("Job Location", "jobLocation")}
          </FormSection>

          {/* Engagement */}
          <FormSection title="Engagement">
            {renderInput("Implementation/End client", "endClient")}
            {renderInput("Vendor Name", "vendorName")}
            {renderInput("Vendor Title", "vendorTitle")}
            {renderInput("Vendor Direct", "vendorDirect")}
            {renderInput("Vendor Email", "vendorEmail")}
            {renderInput("Rate", "rate", "number", false, undefined, false, "no-spinner")}
          </FormSection>

          {/* Dates & Status */}
          <FormSection title="Dates & Status">
            {renderInput("Signup Date", "signupDate", "date")}
            {renderInput("Training", "training", "text", false, ["Yes", "No"])}
            {renderInput("When training done", "trainingDoneDate", "date")}
            {renderInput("Joining Date", "joiningDate", "date")}
            {renderInput("Marketing Start Date", "marketingStart", "date")}
            {renderInput("Marketing End Date", "marketingEnd", "date")}
          </FormSection>

          {/* Org Coverage */}
          <FormSection title="Org Coverage">
            <h4 className="font-semibold text-gray-200 mt-2">Sales</h4>
            {renderInput("Sales Lead By", "salesLeadBy")}
            {renderInput("Sales Person", "salesPerson")}
            {renderInput("Sales Team Lead", "salesTeamLead")}
            {renderInput("Sales Manager", "salesManager")}

            <h4 className="font-semibold text-gray-200 mt-2">Interview Support</h4>
            {renderInput("Support By", "supportBy")}
            {renderInput("Interview Team Lead", "interviewTeamLead")}
            {renderInput("Interview Manager", "interviewManager")}

            <h4 className="font-semibold text-gray-200 mt-2">Marketing</h4>
            {renderInput("Application By", "applicationBy")}
            {renderInput("Recruiter Name", "recruiterName")}
            {renderInput("Marketing Team Lead", "marketingTeamLead")}
            {renderInput("Marketing Manager", "marketingManager")}
          </FormSection>

          {/* Agreement */}
          <FormSection title="Agreement">
            {renderInput("Agreement Percentage", "agreementPercent", "number", false, undefined, false, "no-spinner")}
            {renderInput("Agreement Months", "agreementMonths", "number", false, undefined, false, "no-spinner")}
          </FormSection>

          {/* Misc */}
          <FormSection title="Misc">
            {renderInput("Remarks/Notes (max 500 chars)", "remarks", "text", true)}
          </FormSection>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-[#000000] via-[#b41ff2] to-[#41b1e8] from-[0%] via-[65%] to-[100%] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-[#191919] hover:via-[#a225d1] hover:to-[#3498c8] focus:outline-none focus:ring-2 focus:ring-[#41b1e8] focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 hover:shadow-md"
            >
              Submit
            </button>
          </div>
        </form>

      {/* Popup */}
      {showPopup && submittedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {submittedData.candidateName || "Submitted Data"}
            </h2>
            <div className="overflow-auto max-h-80">
              <table ref={tableRef} className="popup-table w-full border border-gray-700">
                <tbody>
                  {tableOrder.map((item) => {
                    if (typeof item === "string") {
                      const key = item as keyof PlacementFormData;
                      return (
                        <tr key={key} className="border-b border-gray-700">
                          <td className="p-2 font-medium bg-gray-800 text-gray-100">
                            {fieldLabels[key] || key}
                          </td>
                          <td className="p-2 text-gray-200">
                            {submittedData[key] || "N/A"}
                          </td>
                        </tr>
                      );
                    }
                    if ("group" in item) {
                      const section = sectionsByHeading[item.group];
                      return (
                        <tr key={item.group} className="border-b border-gray-700">
                          <td className="p-2 font-medium bg-gray-800 text-gray-100">
                            {section.heading}
                          </td>
                          <td className="p-2 text-gray-200">
                            <div className="flex flex-col">
                              {section.fields.map((f) => (
                                <span key={f.key}>
                                  {f.label} - {submittedData[f.key] || "N/A"}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    if ("combined" in item) {
                      return (
                        <tr key={item.label} className="border-b border-gray-700">
                          <td className="p-2 font-medium bg-gray-800 text-gray-100">
                            {item.label}
                          </td>
                          <td className="p-2 text-gray-200">
                            {item.combined
                              .map((k) => submittedData[k] || "N/A")
                              .join(" / ")}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={copyTable}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-gradient-to-r from-[#000000] via-[#b41ff2] to-[#41b1e8] from-[0%] via-[65%] to-[100%] text-white rounded hover:from-[#191919] hover:via-[#a225d1] hover:to-[#3498c8]"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default PlacementForm;
