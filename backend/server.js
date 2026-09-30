/* ==========================================
   TAMSE BUILDERS - BACKEND SERVER
========================================== */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const { addEnquiry } = require("./services/googleSheets");


/* ==========================================
   APP INITIALIZATION
========================================== */

const app = express();

const PORT = process.env.PORT || 5000;


/* ==========================================
   MIDDLEWARE
========================================== */

app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


/* ==========================================
   BASIC HEALTH CHECK
========================================== */

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "TAMSE Builders backend is running."
    });

});


/* ==========================================
   RESEND EMAIL CONFIGURATION
========================================== */

const resend = new Resend(
    process.env.RESEND_API_KEY
);


/* ==========================================
   VALIDATE EMAIL
========================================== */

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================
   POST /api/enquiry
========================================== */

app.post(
    "/api/enquiry",
    async (req, res) => {

        console.log(
            "\n========================================"
        );

        console.log(
            "📩 New TAMSE enquiry received"
        );

        console.log(
            "========================================"
        );


        try {

            /* ==========================================
               GET DATA FROM REQUEST
            ========================================== */

            const {
                name,
                phone,
                email,
                projectType,
                budget,
                location,
                message
            } = req.body;


            /* ==========================================
               LOG RECEIVED DATA
            ========================================== */

            console.log("Name:", name);
            console.log("Phone:", phone);
            console.log("Email:", email);
            console.log("Project Type:", projectType);
            console.log("Budget:", budget);
            console.log("Location:", location);


            /* ==========================================
               SERVER-SIDE VALIDATION
            ========================================== */

            if (
                !name ||
                !phone ||
                !email ||
                !projectType ||
                !location ||
                !message
            ) {

                console.error(
                    "❌ Required enquiry fields are missing."
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill in all required enquiry fields."

                });

            }


            /* ==========================================
               EMAIL VALIDATION
            ========================================== */

            if (
                !isValidEmail(
                    String(email).trim()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid email address."

                });

            }


            /* ==========================================
               CLEAN DATA
            ========================================== */

            const enquiry = {

                name:
                    String(name).trim(),

                phone:
                    String(phone).trim(),

                email:
                    String(email).trim(),

                projectType:
                    String(projectType).trim(),

                budget:
                    budget
                        ? String(budget).trim()
                        : "",

                location:
                    String(location).trim(),

                message:
                    String(message).trim(),

                status:
                    "New"

            };


            /* ==========================================
               GOOGLE SHEETS
               
               IMPORTANT:
               Save enquiry FIRST.
               
               This means email failure will not
               prevent the enquiry from being saved.
            ========================================== */

            console.log(
                "📊 Adding enquiry to Google Sheet..."
            );

            try {

                await addEnquiry(
                    enquiry
                );

                console.log(
                    "✅ Enquiry added to Google Sheet."
                );

            } catch (sheetError) {

                console.error(
                    "❌ Google Sheet update failed:"
                );

                console.error(
                    sheetError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Your enquiry could not be saved. Please try again later."

                });

            }


            /* ==========================================
               RESEND CONFIGURATION CHECK
            ========================================== */

            if (
                !process.env.RESEND_API_KEY
            ) {

                console.error(
                    "❌ RESEND_API_KEY is missing."
                );

                /*
                 * IMPORTANT:
                 * Google Sheet is already updated.
                 *
                 * Therefore we do NOT return 500 here.
                 */

                return res.status(200).json({

                    success: true,

                    sheetUpdated: true,

                    ownerEmailSent: false,

                    message:
                        "Your enquiry has been received successfully."

                });

            }


            if (
                !process.env.RESEND_FROM_EMAIL
            ) {

                console.error(
                    "❌ RESEND_FROM_EMAIL is missing."
                );

                return res.status(200).json({

                    success: true,

                    sheetUpdated: true,

                    ownerEmailSent: false,

                    message:
                        "Your enquiry has been received successfully."

                });

            }


            if (
                !process.env.TAMSE_EMAIL
            ) {

                console.error(
                    "❌ TAMSE_EMAIL is missing."
                );

                return res.status(200).json({

                    success: true,

                    sheetUpdated: true,

                    ownerEmailSent: false,

                    message:
                        "Your enquiry has been received successfully."

                });

            }


            /* ==========================================
               OWNER EMAIL
            ========================================== */

            const ownerMail = {

                from:
                    process.env.RESEND_FROM_EMAIL,

                to:
                    process.env.TAMSE_EMAIL,

                replyTo:
                    enquiry.email,

                subject:
                    `New Enquiry - ${enquiry.name}`,

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 700px;
                        margin: auto;
                        padding: 20px;
                        color: #222;
                    ">

                        <h2 style="
                            color: #071D3A;
                        ">

                            New Enquiry - TAMSE Builders

                        </h2>

                        <p>

                            A new enquiry has been submitted
                            through the TAMSE Builders website.

                        </p>


                        <table
                            cellpadding="10"
                            cellspacing="0"
                            style="
                                width:100%;
                                border-collapse:collapse;
                                border:1px solid #ddd;
                            "
                        >

                            <tr>

                                <td>
                                    <strong>Name</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.name
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Phone</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.phone
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Email</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.email
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Project Type</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.projectType
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Budget</strong>
                                </td>

                                <td>

                                    ${
                                        enquiry.budget
                                            ? escapeHtml(
                                                enquiry.budget
                                            )
                                            : "Not specified"
                                    }

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Location</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.location
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Message</strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        enquiry.message
                                    )}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    <strong>Status</strong>
                                </td>

                                <td>
                                    New
                                </td>

                            </tr>

                        </table>


                        <p style="
                            margin-top:20px;
                            color:#666;
                        ">

                            This enquiry was submitted
                            from the TAMSE Builders website.

                        </p>

                    </div>

                `

            };


            /* ==========================================
               SEND OWNER EMAIL
            ========================================== */

            console.log(
                "📧 Sending owner email..."
            );

            try {

                const {
                    data: ownerData,
                    error: ownerError
                } = await resend.emails.send({

                    from:
                        ownerMail.from,

                    to:
                        [ownerMail.to],

                    replyTo:
                        ownerMail.replyTo,

                    subject:
                        ownerMail.subject,

                    html:
                        ownerMail.html

                });


                if (ownerError) {

                    console.error(
                        "❌ Owner email failed:"
                    );

                    console.error(
                        ownerError
                    );

                    /*
                     * IMPORTANT:
                     * Google Sheet already contains
                     * the enquiry.
                     *
                     * Therefore don't return 500.
                     */

                    return res.status(200).json({

                        success: true,

                        sheetUpdated: true,

                        ownerEmailSent: false,

                        message:
                            "Your enquiry has been received successfully."

                    });

                }


                console.log(
                    "✅ Owner email sent:",
                    ownerData?.id
                );


            } catch (ownerEmailError) {

                console.error(
                    "❌ Owner email exception:"
                );

                console.error(
                    ownerEmailError
                );

                /*
                 * Enquiry is already saved
                 * in Google Sheet.
                 */

                return res.status(200).json({

                    success: true,

                    sheetUpdated: true,

                    ownerEmailSent: false,

                    message:
                        "Your enquiry has been received successfully."

                });

            }


            /* ==========================================
               CUSTOMER CONFIRMATION EMAIL
               
               TEMPORARILY DISABLED
               
               DO NOT DELETE.
               
               AFTER:
               1. Purchase domain
               2. Verify domain in Resend
               3. Configure sender email
               
               Uncomment this section.
            ========================================== */


/*

            const clientMail = {

                from:
                    process.env.RESEND_FROM_EMAIL,

                to:
                    enquiry.email,

                subject:
                    "Thank you for contacting TAMSE Builders",

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 700px;
                        margin: auto;
                        padding: 20px;
                        color: #222;
                    ">

                        <h2 style="
                            color: #071D3A;
                        ">

                            Thank You,
                            ${escapeHtml(enquiry.name)}!

                        </h2>


                        <p>

                            We have received your
                            enquiry successfully.

                        </p>


                        <p>

                            Our TAMSE Builders team
                            will review your requirements
                            and contact you soon.

                        </p>


                        <hr>


                        <h3 style="
                            color: #E5B52F;
                        ">

                            Your Enquiry Details

                        </h3>


                        <p>

                            <strong>
                                Project Type:
                            </strong>

                            ${escapeHtml(
                                enquiry.projectType
                            )}

                        </p>


                        <p>

                            <strong>
                                Budget:
                            </strong>

                            ${
                                enquiry.budget
                                    ? escapeHtml(
                                        enquiry.budget
                                    )
                                    : "Not specified"
                            }

                        </p>


                        <p>

                            <strong>
                                Location:
                            </strong>

                            ${escapeHtml(
                                enquiry.location
                            )}

                        </p>


                        <p>

                            <strong>
                                Message:
                            </strong>

                            ${escapeHtml(
                                enquiry.message
                            )}

                        </p>


                        <hr>


                        <p>

                            Regards,<br>

                            <strong>
                                TAMSE Builders
                            </strong>

                        </p>

                    </div>

                `

            };


            console.log(
                "📧 Sending client confirmation email..."
            );


            const {
                data: clientData,
                error: clientError
            } = await resend.emails.send({

                from:
                    clientMail.from,

                to:
                    [clientMail.to],

                subject:
                    clientMail.subject,

                html:
                    clientMail.html

            });


            if (clientError) {

                console.error(
                    "❌ Client email failed:",
                    clientError
                );

            } else {

                console.log(
                    "✅ Client confirmation email sent:",
                    clientData?.id
                );

            }

*/


            /* ==========================================
               FINAL SUCCESS RESPONSE
            ========================================== */

            console.log(
                "========================================"
            );

            console.log(
                "✅ ENQUIRY PROCESS COMPLETED"
            );

            console.log(
                "========================================\n"
            );


            return res.status(200).json({

                success: true,

                sheetUpdated: true,

                ownerEmailSent: true,

                message:
                    "Thank you! Your enquiry has been submitted successfully."

            });


        } catch (error) {


            /* ==========================================
               ENQUIRY ERROR
            ========================================== */

            console.error(
                "\n❌ ENQUIRY PROCESS FAILED"
            );


            console.error(
                "Error message:",
                error.message
            );


            console.error(
                "Error code:",
                error.code
            );


            console.error(
                "Error command:",
                error.command
            );


            console.error(
                "Error response:",
                error.response
            );


            return res.status(500).json({

                success: false,

                message:
                    "We could not process your enquiry right now. Please try again later."

            });

        }

    }
);


/* ==========================================
   404 HANDLER
========================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


/* ==========================================
   GLOBAL ERROR HANDLER
========================================== */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ Server error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(error);

        }


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


/* ==========================================
   START SERVER
========================================== */

console.log(
    "🔵 About to start HTTP server..."
);


const server = app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "🏗️ TAMSE BUILDERS BACKEND"
        );

        console.log(
            "========================================"
        );


        console.log(
            `🚀 Server running on port ${PORT}`
        );


        console.log(
            `🌐 API: http://localhost:${PORT}`
        );


        console.log(
            `📩 Enquiry API: http://localhost:${PORT}/api/enquiry`
        );


        console.log(
            "========================================"
        );

        console.log("");

    }
);


/* ==========================================
   SERVER EVENTS
========================================== */

server.on(
    "listening",
    () => {

        console.log(
            "🟢 SERVER LISTENING EVENT FIRED"
        );


        console.log(
            "🟢 Server address:",
            server.address()
        );

    }
);


server.on(
    "close",
    () => {

        console.log(
            "🔴 SERVER CLOSE EVENT FIRED"
        );

    }
);


server.on(
    "error",
    (error) => {

        console.error(
            "========================================"
        );

        console.error(
            "❌ SERVER ERROR"
        );

        console.error(
            "========================================"
        );

        console.error(error);

    }
);


/* ==========================================
   NODE PROCESS EVENTS
========================================== */

process.on(
    "beforeExit",
    (code) => {

        console.log(
            "⚠️ NODE BEFORE EXIT:",
            code
        );

    }
);


process.on(
    "exit",
    (code) => {

        console.log(
            "⚠️ NODE PROCESS EXIT:",
            code
        );

    }
);