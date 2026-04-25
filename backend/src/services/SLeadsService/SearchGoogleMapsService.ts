import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import { getIO } from "../../libs/socket";

interface SLeadsRequest {
  query: string;
  companyId: number;
}

const regexFallbackExtract = (text: string): { name: string; number: string }[] => {
    console.log("Starting Regex Fallback extraction...");
    // Broader regex for international phone numbers
    const phoneRegex = /(?:\+|00)?(?:[1-9]\d{0,3}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/g;
    const lines = text.split("\n");
    const results = [];
    const seenNumbers = new Set();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const matches = line.match(phoneRegex);
        
        if (matches) {
            for (const match of matches) {
                let cleanNumber = match.replace(/\D/g, "");
                
                // Skip very short or very long strings that might be misinterpreted
                if (cleanNumber.length < 8 || cleanNumber.length > 15) continue;

                // Basic BR formatting logic
                if (cleanNumber.length === 11 && cleanNumber.startsWith("9")) cleanNumber = "55" + cleanNumber;
                else if (cleanNumber.length === 10) cleanNumber = "55" + cleanNumber.substring(0, 2) + "9" + cleanNumber.substring(2);
                else if (cleanNumber.length === 9 && cleanNumber.startsWith("9")) cleanNumber = "351" + cleanNumber; // Likely Portugal

                if (!seenNumbers.has(cleanNumber)) {
                    let name = "Lead Coletado";
                    for (let j = 1; j <= 5; j++) {
                        if (i - j >= 0) {
                            const prevLine = lines[i - j].trim();
                            if (prevLine && !prevLine.match(/^\d\.\d/) && prevLine.length > 3 && prevLine.length < 60) {
                                name = prevLine;
                                break;
                            }
                        }
                    }
                    results.push({ name, number: cleanNumber });
                    seenNumbers.add(cleanNumber);
                }
            }
        }
    }
    return results;
};

const SearchGoogleMapsService = async ({ query, companyId }: SLeadsRequest): Promise<void> => {
  console.log(`Starting SLeads search for: ${query}`);

  let browser;
  try {
    // 1. Scrape Google Maps
    browser = await puppeteer.launch({ 
        headless: true, 
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"] 
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Construct search URL
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the results pane to load - trying multiple possible selectors
    const feedSelector = '[role="feed"], .m67qEc, [aria-label*="Resultados"]';
    await page.waitForSelector(feedSelector, { timeout: 20000 }).catch(() => console.log("Feed selector not found, trying fallback extraction."));

    // Scroll down more times to load a significant number of results
    let lastHeight = await page.evaluate((sel) => {
        const feed = document.querySelector(sel);
        return feed ? feed.scrollHeight : 0;
    }, feedSelector);

    for (let i = 0; i < 20; i++) {
        await page.evaluate((sel) => {
            const feed = document.querySelector(sel);
            if (feed) feed.scrollBy(0, 10000);
            else window.scrollBy(0, 10000);
        }, feedSelector);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let newHeight = await page.evaluate((sel) => {
            const feed = document.querySelector(sel);
            return feed ? feed.scrollHeight : 0;
        }, feedSelector);
        
        if (newHeight === lastHeight && i > 8) break; 
        lastHeight = newHeight;
    }

    // Extract text from the results pane
    const rawData = await page.evaluate((sel) => {
        const feed = document.querySelector(sel) as any;
        return feed ? feed.innerText : document.body.innerText;
    }, feedSelector);

    console.log(`SLeads: Scraped ${rawData.length} characters from Maps.`);

    await browser.close();

    if (!rawData || rawData.length < 100) {
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-sleads`, {
            action: "error",
            message: "Não foi possível encontrar resultados no Google Maps para esta busca. Verifique o termo e tente novamente."
        });
        return;
    }

    // 2. Use AI to extract valid WhatsApp contacts
    let geminiApiKey = await GetCompanySetting(companyId, "geminiApiKey", "");
    
    // Fallback to company 1 if not found for current company
    if (!geminiApiKey || geminiApiKey.trim() === "") {
        console.log(`Gemini API Key not found for company ${companyId}, trying company 1...`);
        geminiApiKey = await GetCompanySetting(1, "geminiApiKey", "");
    }

    if (!geminiApiKey || geminiApiKey.trim() === "") {
        const errorMsg = "SLeads aborted: Gemini API Key is not configured in the system.";
        console.log(errorMsg);
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-sleads`, {
            action: "error",
            message: "Configuração ausente: Por favor, configure a sua Gemini API Key."
        });
        return;
    }

    let aiAgentModel = await GetCompanySetting(companyId, "aiAgentModel", "");
    if (!aiAgentModel || aiAgentModel.trim() === "") {
        aiAgentModel = await GetCompanySetting(1, "aiAgentModel", "gemini-1.5-flash");
    }
    
    // Fix common typos or invalid future-dated models
    if (aiAgentModel.includes("2.5")) {
        console.log(`Invalid model detected: ${aiAgentModel}. Reverting to gemini-2.0-flash.`);
        aiAgentModel = "gemini-2.0-flash";
    }

    console.log(`SLeads using model: ${aiAgentModel} and API Key ending in ...${geminiApiKey.slice(-4)}`);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: aiAgentModel });

    const prompt = `
Você é um especialista em extração de dados e inteligência comercial. O texto abaixo foi extraído de uma pesquisa extensa no Google Maps por "${query}".
Seu objetivo é ser EXAUSTIVO e extrair TODOS os nomes de empresas/profissionais e seus respectivos números de TELEFONE ou WHATSAPP encontrados.

Retorne os dados EXCLUSIVAMENTE em formato JSON, como uma lista de objetos com as chaves "name" e "number".
Exemplo de saída:
[
  {"name": "Empresa A", "number": "5511999999999"},
  {"name": "Corretor B", "number": "5511888888888"}
]

Regras Cruciais:
1. Extraia o máximo de leads possível. Não pule nenhum.
2. O campo "number" deve conter apenas dígitos (Ex: 5511999999999). 
3. Se o número não tiver o código do país, assuma Brasil (55) e o DDD da região se possível.
4. Nomes devem ser limpos e profissionais.
5. NÃO responda com nada além do JSON. Sem explicações ou blocos de código markdown.

TEXTO EXTRAÍDO (Pode conter muitos dados):
${rawData}
`;

    let extractedContacts = [];
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        extractedContacts = JSON.parse(cleanJsonText);
        console.log(`AI extracted ${extractedContacts.length} contacts.`);
    } catch (aiError) {
        console.error("AI Extraction failed, falling back to Regex:", aiError.message);
        extractedContacts = regexFallbackExtract(rawData);
    }

    if (!Array.isArray(extractedContacts) || extractedContacts.length === 0) {
        // One last try with regex if AI returned empty array
        extractedContacts = regexFallbackExtract(rawData);
    }

    if (extractedContacts.length === 0) {
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-sleads`, {
            action: "error",
            message: "A IA não conseguiu identificar contatos válidos e o extrator de segurança também não encontrou números de WhatsApp no texto."
        });
        return;
    }

    // 3. Save to Contact List
    const contactList = await ContactList.create({
        name: `SLeads - ${query} - ${new Date().toLocaleDateString()}`,
        companyId
    });

    const io = getIO();
    const savedContacts = [];

    for (const contactData of extractedContacts) {
        if (contactData.name && contactData.number) {
            const newItem = await ContactListItem.create({
                name: contactData.name,
                number: contactData.number,
                contactListId: contactList.id,
                companyId
            });
            savedContacts.push(newItem);
        }
    }

    // Emit event to frontend
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-sleads`, {
        action: "update",
        record: savedContacts
    });

    console.log(`SLeads completed. Saved ${savedContacts.length} contacts to list ID ${contactList.id}`);

  } catch (error) {
    console.error("Error in SearchGoogleMapsService:", error);
    if (browser) await browser.close();

    // Notify frontend of the error
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-sleads`, {
        action: "error",
        message: error.message || "Erro desconhecido na extração de leads."
    });
  }
};

export default SearchGoogleMapsService;
