import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { type LetterRequest } from "@shared/schema";
import path from "path";
import fs from "fs";

const templateContent: Record<string, string> = {
  US: `[Date: {currentDate}]

U.S. Department of Homeland Security
Customs and Border Protection
United States Port of Entry

Re: Visitor Admission for {employeeName}
    Country of Citizenship: {citizenship}

Dear Officer:

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions and related solutions related to the ecosystem around private capital to our global clientele.

This letter is submitted in support of the business visitor request for admission for {employeeName}, to attend business meetings at Carta's offices. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle} and during this business trip to the U.S., {employeeName} will attend internal business meetings and collaborate with team members.

{employeeName}'s trip to the United States is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our international subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  UK: `[Date: {currentDate}]

To Whom It May Concern

Dear Officer:

RE: Business Visitor Entry on behalf of {employeeName}
    Nationality: {citizenship}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States and offers highly specialized equity management software solutions to our global clientele.

Effective June 30, 2022, Vauban Technologies Limited ("Vauban") based in the U.K. was acquired by U.S.-based Carta, Inc.

This letter is submitted in support of the business visitor request for admission for {employeeName}, to attend business meetings at our London office. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle} and during this business trip to the U.K., {employeeName} will attend internal business meetings and collaborate with team members.

{employeeName}'s trip to London, U.K. is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

Therefore, we would be grateful if {employeeName} could be granted leave to enter the UK as a standard visitor in accordance with the Immigration Rules, Appendix V: Visitor Rules, to undertake permitted legal related activities, as set out in Appendix Visitor: Permitted Activities.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

Vauban Technologies Limited

______________________
Carta Travel Team
travel@carta.com`,

  CA: `[Date: {currentDate}]

Canada Border Services Agency

RE: Business Visitor Entry on behalf of {employeeName}

Dear Officer:

Carta Maple Technologies, Inc. ("Carta Canada") is incorporated in British Columbia and extra-provincially registered in Ontario. Carta Canada is the wholly owned subsidiary of eShares, Inc. dba Carta, Inc. ("Carta"), a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {employeeName}, a citizen of {citizenship}, to attend business meetings at our Toronto office. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle} and during this business trip to Canada, {employeeName} will attend internal business meetings and collaborate with team members.

{employeeName}'s trip to Canada is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

CARTA MAPLE TECHNOLOGIES, INC.

______________________
Carta Travel Team
travel@carta.com`,

  BR: `[Date: {currentDate}]

Consulate General of Brazil
Consular Section

RE: Business Visitor Entry on behalf of {employeeName}

Dear Officer:

eShares Desenvolvimento de Softwares Ltda ("Carta Brazil") is a wholly-owned subsidiary of eShares, Inc. dba Carta, Inc. ("Carta"), a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions and related solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {employeeName}, a citizen of {citizenship}. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle}. During this business trip to Brazil, {employeeName} will visit Carta Brazil's office and attend internal business meetings.

{employeeName}'s trip to Brazil is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our subsidiary, and Carta will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Sincerely,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  DE: `[Date: {currentDate}]

Sehr geehrte Damen und Herren / Dear Sir or Madam,

RE: Business Visitor Entry on behalf of {employeeName}
    Nationality: {citizenship}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {employeeName}, to attend business meetings in Germany. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle} and during this business trip to Germany, {employeeName} will attend internal business meetings and collaborate with team members.

{employeeName}'s trip to Germany is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

Thank you for your attention to this important matter. Please feel free to contact the undersigned if you have any questions.

Mit freundlichen Grüßen / Kind regards,

ESHARES, INC. DBA CARTA, INC.

______________________
Carta Travel Team
travel@carta.com

eShares, Inc. dba Carta, Inc.
333 Bush Street, 23rd Floor, Suite 2300
San Francisco, California 94104`,

  JP: `[Date: {currentDate}]

Dear Immigration Officer,

RE: Business Visitor Entry on behalf of {employeeName}
    Nationality: {citizenship}

eShares, Inc. dba Carta, Inc. ("Carta") is a Delaware corporation in the United States of America incorporated in 2012. Carta is an innovative, high value and high-growth company. The Carta group of companies maintains worldwide headquarters in San Francisco, California in the United States of America and offers highly specialized equity management software solutions to our global clientele.

This letter is submitted in support of the business visitor request for admission for {employeeName}, to attend business meetings in Japan. {employeeName}'s expected travel dates are {departureDate} to {returnDate}. {employeeName} is currently employed within the Carta group as {employeeTitle} and during this business trip to Japan, {employeeName} will attend internal business meetings and collaborate with team members.

{employeeName}'s trip to Japan is limited both in duration and scope, and will engage only in these limited business activities during this stay. {employeeName} will remain at all times an employee of our subsidiary, and the company will be responsible for all costs and expenses in connection with this business trip. Upon conclusion of this temporary stay, {employeeName} will return to their full-time position.

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

const purposeLabels: Record<string, string> = {
  BUSINESS: "Business Meetings",
};

export function generateLetter(request: LetterRequest): string {
  const template = templateContent[request.template];
  
  if (!template) {
    throw new Error(`Template not found: ${request.template}`);
  }
  
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  let content = template
    .replace(/{employeeName}/g, request.employeeName)
    .replace(/{employeeEmail}/g, request.employeeEmail)
    .replace(/{employeeTitle}/g, request.employeeTitle || "Team Member")
    .replace(/{destinationCountry}/g, request.destinationCountry)
    .replace(/{citizenship}/g, request.citizenship)
    .replace(/{departureDate}/g, formatDate(request.departureDate))
    .replace(/{returnDate}/g, formatDate(request.returnDate))
    .replace(/{purpose}/g, purposeLabels[request.purpose] || request.purpose)
    .replace(/{currentDate}/g, currentDate);
  
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

export function generateLetterBuffer(request: LetterRequest): Buffer {
  const content = generateLetter(request);
  return Buffer.from(content, "utf-8");
}
