/* ==========================================
   TAMSE BUILDERS
   GOOGLE SHEETS SERVICE
========================================== */

const { google } = require("googleapis");


/* ==========================================
   GOOGLE SHEET ID
========================================== */

const SPREADSHEET_ID =
    "1MjTXo8O8zzQgEclTwv9lOZ2we9UQn-n1syd58paNlKI";


/* ==========================================
   SHEET NAME
========================================== */

const SHEET_NAME = "Sheet1";


/* ==========================================
   GET GOOGLE SHEETS CLIENT
========================================== */

async function getGoogleSheets() {

    try {

        console.log(
            "🔐 Creating Google Sheets authentication..."
        );


        /* ==========================================
           GET SERVICE ACCOUNT FROM RENDER ENV
        ========================================== */

        if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {

            throw new Error(
                "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing."
            );

        }


        const credentials =
            JSON.parse(
                process.env.GOOGLE_SERVICE_ACCOUNT_JSON
            );


        /* ==========================================
           FIX PRIVATE KEY NEWLINES
        ========================================== */

        if (credentials.private_key) {

            credentials.private_key =
                credentials.private_key.replace(
                    /\\n/g,
                    "\n"
                );

        }


        /* ==========================================
           GOOGLE AUTHENTICATION
        ========================================== */

        const auth =
            new google.auth.GoogleAuth({

                credentials: credentials,

                scopes: [
                    "https://www.googleapis.com/auth/spreadsheets"
                ]

            });


        /* ==========================================
           GET AUTH CLIENT
        ========================================== */

        const client =
            await auth.getClient();


        /* ==========================================
           CREATE GOOGLE SHEETS CLIENT
        ========================================== */

        const sheets =
            google.sheets({

                version: "v4",

                auth: client

            });


        console.log(
            "✅ Google Sheets authentication successful."
        );


        return sheets;


    } catch (error) {

        console.error(
            "❌ Google Sheets authentication failed:"
        );

        console.error(
            error.message
        );

        throw error;

    }

}


/* ==========================================
   ADD ENQUIRY
========================================== */

async function addEnquiry(enquiry) {

    try {

        console.log(
            "📊 Saving enquiry to Google Sheet..."
        );


        /* ==========================================
           GET GOOGLE SHEETS CLIENT
        ========================================== */

        const sheets =
            await getGoogleSheets();


        /* ==========================================
           TIMESTAMP
        ========================================== */

        const timestamp =
            new Date().toLocaleString(
                "en-IN",
                {
                    timeZone: "Asia/Kolkata"
                }
            );


        /* ==========================================
           CONVERT VALUES TO STRING
        ========================================== */

        const name =
            String(
                enquiry.name || ""
            );


        const phone =
            String(
                enquiry.phone || ""
            );


        const email =
            String(
                enquiry.email || ""
            );


        const projectType =
            String(
                enquiry.projectType || ""
            );


        const budget =
            String(
                enquiry.budget || ""
            );


        const location =
            String(
                enquiry.location || ""
            );


        const message =
            String(
                enquiry.message || ""
            );


        const status =
            String(
                enquiry.status || "New"
            );


        /* ==========================================
           CREATE GOOGLE SHEET ROW

           A = Date & Time
           B = Name
           C = Phone
           D = Email
           E = Project Type
           F = Budget
           G = Project Location
           H = Project Details
           I = Status
        ========================================== */

        const row = [

            timestamp,

            name,

            phone,

            email,

            projectType,

            budget,

            location,

            message,

            status

        ];


        console.log(
            "Google Sheet row:"
        );

        console.log(
            row
        );


        /* ==========================================
           APPEND ROW TO GOOGLE SHEET
        ========================================== */

        const response =
            await sheets.spreadsheets.values.append({

                spreadsheetId:
                    SPREADSHEET_ID,

                range:
                    `${SHEET_NAME}!A:I`,

                valueInputOption:
                    "RAW",

                insertDataOption:
                    "INSERT_ROWS",

                requestBody: {

                    values: [
                        row
                    ]

                }

            });


        /* ==========================================
           SUCCESS
        ========================================== */

        console.log(
            "✅ Google Sheet updated successfully."
        );


        console.log(
            "Updated range:",
            response.data.updates?.updatedRange
        );


        return {

            success: true,

            updatedRange:
                response.data.updates?.updatedRange || null

        };


    } catch (error) {

        /* ==========================================
           GOOGLE SHEETS ERROR
        ========================================== */

        console.error(
            "❌ Google Sheets Error:"
        );

        console.error(
            error.message
        );

        console.error(
            error
        );

        throw error;

    }

}


/* ==========================================
   EXPORT
========================================== */

module.exports = {

    addEnquiry

};