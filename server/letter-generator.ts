import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { type LetterRequest } from "@shared/schema";
import path from "path";
import fs from "fs";

// Template content stored as base64 strings since we can't include actual DOCX files
// These would normally be loaded from actual template files

const templateContent: Record<string, string> = {
  US: `Dear Immigration Officer,

This letter is to confirm that {employeeName} ({employeeEmail}) is an employee of Carta, Inc. and is traveling to the United States for business purposes.

Travel Details:
- Destination: {destinationCountry}
- Departure Date: {departureDate}
- Return Date: {returnDate}
- Purpose: {purpose}

During this visit, {employeeName} will be attending business meetings, and will not be engaging in any employment activities that would require a work visa. All expenses will be covered by Carta, Inc.

{employeeName} is expected to return to their home country on or before {returnDate}.

If you have any questions, please contact:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
travel@carta.com

Sincerely,
Carta Travel Team`,

  UK: `Dear Border Force Officer,

This letter confirms that {employeeName} ({employeeEmail}) is employed by Carta, Inc. and is traveling to the United Kingdom for legitimate business purposes.

Visit Details:
- Destination: {destinationCountry}
- Arrival Date: {departureDate}
- Departure Date: {returnDate}
- Purpose of Visit: {purpose}

The purpose of this visit is to attend business meetings and {employeeName} will not be taking employment or providing services to UK clients. Carta, Inc. will continue to pay their salary during this trip.

{employeeName} will depart the United Kingdom no later than {returnDate}.

For verification, please contact:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
Email: travel@carta.com

Yours faithfully,
Carta Travel Department`,

  CA: `To Whom It May Concern,

This letter serves as confirmation that {employeeName} ({employeeEmail}) is a bona fide employee of Carta, Inc. and is visiting Canada for business purposes.

Trip Information:
- Destination: {destinationCountry}
- Entry Date: {departureDate}
- Exit Date: {returnDate}
- Business Purpose: {purpose}

{employeeName} is visiting as a business visitor and will not be entering the Canadian labor market. Their primary source of remuneration remains outside Canada, and any business activities during this visit will be limited to meetings, conferences, or after-sales service.

Expected departure from Canada: {returnDate}

Contact for verification:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
travel@carta.com

Best regards,
Carta Travel Team`,

  BR: `Prezado(a) Oficial de Imigração / Dear Immigration Officer,

Esta carta confirma que {employeeName} ({employeeEmail}) é funcionário(a) da Carta, Inc. e está viajando ao Brasil para fins comerciais.

This letter confirms that {employeeName} ({employeeEmail}) is an employee of Carta, Inc. and is traveling to Brazil for business purposes.

Detalhes da Viagem / Travel Details:
- Destino / Destination: {destinationCountry}
- Data de Chegada / Arrival Date: {departureDate}
- Data de Partida / Departure Date: {returnDate}
- Propósito / Purpose: {purpose}

{employeeName} participará de reuniões de negócios e não exercerá atividades que requeiram visto de trabalho.

{employeeName} will attend business meetings and will not engage in activities requiring a work visa.

Contato / Contact:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
travel@carta.com

Atenciosamente / Sincerely,
Carta Travel Team`,

  DE: `Sehr geehrte Damen und Herren / Dear Sir or Madam,

This letter confirms that {employeeName} ({employeeEmail}) is employed by Carta, Inc. and is traveling to Germany for business purposes.

Travel Details:
- Destination: {destinationCountry}
- Arrival Date: {departureDate}
- Departure Date: {returnDate}
- Purpose of Visit: {purpose}

{employeeName} will be attending business meetings and will not be engaging in any paid work requiring a work permit. Carta, Inc. will continue to pay their salary during this business trip.

{employeeName} will depart Germany no later than {returnDate}.

For verification, please contact:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
Email: travel@carta.com

Mit freundlichen Grüßen / Kind regards,
Carta Travel Team`,

  JP: `Dear Immigration Officer,

This letter confirms that {employeeName} ({employeeEmail}) is an employee of Carta, Inc. and is traveling to Japan for business purposes.

Travel Details:
- Destination: {destinationCountry}
- Arrival Date: {departureDate}
- Departure Date: {returnDate}
- Purpose of Visit: {purpose}

During this visit, {employeeName} will be attending business meetings and will not be engaging in any employment activities that would require a work visa. All expenses will be covered by Carta, Inc.

{employeeName} is expected to depart Japan on or before {returnDate}.

Contact for verification:
Carta, Inc.
333 Bush Street, Floor 23
San Francisco, CA 94104
travel@carta.com

Sincerely,
Carta Travel Team`
};

const purposeLabels: Record<string, string> = {
  BUSINESS: "Business Meetings",
};

export function generateLetter(request: LetterRequest): string {
  const template = templateContent[request.template];
  
  if (!template) {
    throw new Error(`Template not found: ${request.template}`);
  }
  
  // Replace placeholders
  let content = template
    .replace(/{employeeName}/g, request.employeeName)
    .replace(/{employeeEmail}/g, request.employeeEmail)
    .replace(/{destinationCountry}/g, request.destinationCountry)
    .replace(/{departureDate}/g, formatDate(request.departureDate))
    .replace(/{returnDate}/g, formatDate(request.returnDate))
    .replace(/{purpose}/g, purposeLabels[request.purpose] || request.purpose);
  
  return content;
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

// Generate a simple text file that can be downloaded
// In production, this would generate actual DOCX using templates
export function generateLetterBuffer(request: LetterRequest): Buffer {
  const content = generateLetter(request);
  return Buffer.from(content, "utf-8");
}
