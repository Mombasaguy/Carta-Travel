import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import mime from "mime";
import { type LetterRequest } from "@shared/schema";
import path from "path";
import fs from "fs";

// Template content for text-based generation (fallback)
const templateContent: Record<string, string> = {
  US: `[Date: {CURRENT_DATE}]

U.S. Department of Homeland Security
Customs and Border Protection
United States Port of Entry

Re: Visitor Admission for {FULL_NAME}
    Country of Citizenship: {CITIZENSHIP}

Dear Officer:

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions and related solutions related to the ecosystem around private capital to our global clientele.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, to attend business meetings at Carta's offices. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE} and during this business trip to the U.S., {FULL_NAME} will attend internal business meetings and collaborate with team members.

{FULL_NAME}'s trip to the United States is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our international subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  UK: `[Date: {CURRENT_DATE}]

To Whom It May Concern

Dear Officer:

RE: Business Visitor Entry on behalf of {FULL_NAME}
    Nationality: {CITIZENSHIP}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States and offers highly specialized equity management software solutions to our global clientele.

Effective June 30, 2022, Vauban Technologies Limited ("Vauban") based in the U.K. was acquired by U.S.-based Carta, Inc.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, to attend business meetings at our London office. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE} and during this business trip to the U.K., {FULL_NAME} will attend internal business meetings and collaborate with team members.

{FULL_NAME}'s trip to London, U.K. is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Therefore, we would be grateful if {FULL_NAME} could be granted leave to enter the UK as a standard visitor in accordance with the Immigration Rules, Appendix V: Visitor Rules, to undertake permitted legal related activities, as set out in Appendix Visitor: Permitted Activities.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

Vauban Technologies Limited

______________________
Carta Travel Team
travel@carta.com`,

  CA: `[Date: {CURRENT_DATE}]

Canada Border Services Agency

RE: Business Visitor Entry on behalf of {FULL_NAME}

Dear Officer:

Carta Maple Technologies, Inc. ("Carta Canada") is incorporated in British Columbia and extra-provincially registered in Ontario. Carta Canada is the wholly owned subsidiary of eShares, Inc. dba Carta, Inc. ("Carta"), a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, a citizen of {CITIZENSHIP}, to attend business meetings at our Toronto office. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE} and during this business trip to Canada, {FULL_NAME} will attend internal business meetings and collaborate with team members.

{FULL_NAME}'s trip to Canada is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

CARTA MAPLE TECHNOLOGIES, INC.

______________________
Carta Travel Team
travel@carta.com`,

  BR: `[Date: {CURRENT_DATE}]

Consulate General of Brazil
Consular Section

RE: Business Visitor Entry on behalf of {FULL_NAME}

Dear Officer:

eShares Desenvolvimento de Softwares Ltda ("Carta Brazil") is a wholly-owned subsidiary of eShares, Inc. dba Carta, Inc. ("Carta"), a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions and related solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, a citizen of {CITIZENSHIP}. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE}. During this business trip to Brazil, {FULL_NAME} will visit Carta Brazil's office and attend internal business meetings.

{FULL_NAME}'s trip to Brazil is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our subsidiary, and Carta will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  DE: `[Date: {CURRENT_DATE}]

Sehr geehrte Damen und Herren / Dear Sir or Madam,

RE: Business Visitor Entry on behalf of {FULL_NAME}
    Nationality: {CITIZENSHIP}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, to attend business meetings in Germany. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE} and during this business trip to Germany, {FULL_NAME} will attend internal business meetings and collaborate with team members.

{FULL_NAME}'s trip to Germany is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Mit freundlichen Grüßen / Kind regards,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  JP: `[Date: {CURRENT_DATE}]

Dear Immigration Officer,

RE: Business Visitor Entry on behalf of {FULL_NAME}
    Nationality: {CITIZENSHIP}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {FULL_NAME}, to attend business meetings in Japan. {FULL_NAME}'s expected travel dates are {DEPARTURE_DATE} to {RETURN_DATE}. {FULL_NAME} is currently employed within the Carta group as {EMPLOYEE_TITLE} and during this business trip to Japan, {FULL_NAME} will attend internal business meetings and collaborate with team members.

{FULL_NAME}'s trip to Japan is limited both in duration and scope, and will engage only in these limited business activities during this stay. {FULL_NAME} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {FULL_NAME} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`
};

// Merge data interface matching Next.js pattern
export interface LetterMergeData {
  FULL_NAME: string;
  EMPLOYEE_EMAIL: string;
  EMPLOYEE_TITLE: string;
  CITIZENSHIP: string;
  DEPARTURE_DATE: string;
  RETURN_DATE: string;
  CURRENT_DATE: string;
  PURPOSE?: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
}

// Convert LetterRequest to merge data format
export function requestToMergeData(request: LetterRequest): LetterMergeData {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  return {
    FULL_NAME: request.employeeName,
    EMPLOYEE_EMAIL: request.employeeEmail,
    EMPLOYEE_TITLE: request.employeeTitle || "Team Member",
    CITIZENSHIP: request.citizenship,
    DEPARTURE_DATE: formatDate(request.departureDate),
    RETURN_DATE: formatDate(request.returnDate),
    CURRENT_DATE: currentDate,
    PURPOSE: request.purpose,
  };
}

// Generate letter from DOCX template if available, fallback to text
export function generateLetterDocx(templateId: string, merge: LetterMergeData): { buffer: Buffer; contentType: string; filename: string } {
  const templatePath = path.join(process.cwd(), "templates", `${templateId}.docx`);
  
  if (fs.existsSync(templatePath)) {
    // Use DOCX template
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    
    doc.setData(merge);
    doc.render();
    
    const buf = doc.getZip().generate({ type: "nodebuffer" });
    const filename = `Carta_Invitation_Letter_${templateId}.docx`;
    const contentType = mime.getType(filename) || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    
    return { buffer: buf, contentType, filename };
  }
  
  // Fallback to text-based generation
  const template = templateContent[templateId];
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  let text = template;
  for (const [key, value] of Object.entries(merge)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
  }
  
  const filename = `Carta_Invitation_Letter_${templateId}.txt`;
  return { 
    buffer: Buffer.from(text, "utf-8"), 
    contentType: "text/plain", 
    filename 
  };
}

// Legacy function for backward compatibility
export function generateLetter(request: LetterRequest): string {
  const merge = requestToMergeData(request);
  const template = templateContent[request.template];
  
  if (!template) {
    throw new Error(`Template not found: ${request.template}`);
  }
  
  let content = template;
  for (const [key, value] of Object.entries(merge)) {
    content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
  }
  
  return content;
}

export function generateLetterBuffer(request: LetterRequest): Buffer {
  const content = generateLetter(request);
  return Buffer.from(content, "utf-8");
}

// New DOCX-based letter generation matching Next.js pattern
export function generateDocxLetter(templateId: string, merge: Record<string, string>): { buffer: Buffer; contentType: string; filename: string } {
  const templatePath = path.join(process.cwd(), "templates", `${templateId}.docx`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  
  doc.setData(merge);
  doc.render();
  
  const buf = doc.getZip().generate({ type: "nodebuffer" });
  const filename = `Carta_Invitation_Letter_${templateId}.docx`;
  const contentType = mime.getType(filename) || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  
  return { buffer: buf, contentType, filename };
}
