/* ==========================================
   TAMSE BUILDERS
   GOOGLE SHEETS SERVICE
========================================== */

const path = require("path");
const { google } = require("googleapis");


/* ==========================================
   GOOGLE CREDENTIALS
========================================== */

const KEY_FILE = path.join(
    __dirname,
    "../google-credentials.json"
);


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

    const auth =
        new google.auth.GoogleAuth({

            keyFile: KEY_FILE,

            scopes: [
                "https://www.googleapis.com/auth/spreadsheets"
            ]

        });


    const client =
        await auth.getClient();


    const sheets =
        google.sheets({

            version: "v4",

            auth: client

        });


    return sheets;
}


/* ==========================================
   ADD ENQUIRY
========================================== */

async function addEnquiry(enquiry) {

    try {

        console.log(
            "📊 Saving enquiry to Google Sheet..."
        );


        const sheets =
            await getGoogleSheets();


        /* ==========================================
           CONVERT EVERYTHING TO STRING

           This is especially important for phone
           numbers so Google Sheets doesn't try to
           calculate/interpret them.
        ========================================== */

        const timestamp =
            new Date().toLocaleString(
                "en-IN",
                {
                    timeZone: "Asia/Kolkata"
                }
            );


        const name =
            String(enquiry.name || "");


        const phone =
            String(enquiry.phone || "");


        const email =
            String(enquiry.email || "");


        const projectType =
            String(enquiry.projectType || "");


        const budget =
            String(enquiry.budget || "");


        const location =
            String(enquiry.location || "");


        const message =
            String(enquiry.message || "");


        const status =
            String(enquiry.status || "New");


        /* ==========================================
           CREATE ROW

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
           APPEND ROW
        ========================================== */

        const response =
            await sheets.spreadsheets.values.append({

                spreadsheetId:
                    SPREADSHEET_ID,

                range:
                    `${SHEET_NAME}!A:I`,

                /*
                    RAW is important here.

                    Google Sheets will store the
                    values exactly as strings instead
                    of trying to interpret phone
                    numbers/formulas.
                */

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

        console.error(
            "❌ Google Sheets Error:"
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