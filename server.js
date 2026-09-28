// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const sgMail = require("@sendgrid/mail");

// dotenv.config();

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.static("public"));

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// //
// //
// const fs = require("fs");
// app.post("/send-email", async (req, res) => {
//   const { to, subject, message } = req.body;

//   const msg = {
//     to: to,
//     from: process.env.EMAIL_FROM,
//     subject: subject,
//     text: message,
//   };

//   try {
//     await sgMail.send(msg);

//     // Save history
//     const log = `To: ${to}, Subject: ${subject}\n`;
//     fs.appendFileSync("emails.txt", log);

//     res.send("Email sent successfully!");
//     //await sgMail.send(msg);
//     //res.send("Email sent successfully!");
//   } catch (error) {
//     console.error(error);
//     res.send("Error sending email");
//   }
// });

// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// app.post("/send-email", async (req, res) => {
//   const { to, subject, message } = req.body;

//   const msg = {
//     to: to,
//     from: process.env.EMAIL_FROM,
//     subject: subject,
//     text: message,
//   };

//   try {
//     await sgMail.send(msg);

//     console.log("Email sent successfully!");
//     console.log("Saving email history...");

//     // Ensure file exists and append
//     const log = `To: ${to}, Subject: ${subject}, Message: ${message}\n`;
//     console.log("Saving at:", __dirname);
//     fs.appendFileSync(__dirname + "\\emails.txt", log, { encoding: "utf8" });
//     res.send("Email sent successfully!");
//   } catch (error) {
//     console.error("SendGrid Error:", error.response?.body || error.message);
//     res.send("Error sending email");
//   }
// });
// app.post("/send-email", upload.single("file"), async (req, res) => {
//   const { to, subject, message } = req.body;
//   const file = req.file;

//   const msg = {
//     to: to,
//     from: process.env.EMAIL_FROM,
//     subject: subject,
//     text: message,
//     attachments: [
//       {
//         content: require("fs").readFileSync(file.path).toString("base64"),
//         filename: file.originalname,
//         type: "application/pdf",
//         disposition: "attachment",
//       },
//     ],
//   };

//   try {
//     await sgMail.send(msg);

//     console.log("Email sent with attachment!");

//     const log = `To: ${to}, Subject: ${subject}, Message: ${message}, File: ${file.originalname}\n`;
//     fs.appendFileSync(__dirname + "\\emails.txt", log, { encoding: "utf8" });

//     res.send("Email sent with file!");
//   } catch (error) {
//     console.error(error);
//     res.send("Error sending email");
//   }
// });

app.post("/send-email", upload.single("file"), async (req, res) => {
  const { to, subject, message } = req.body;
  const file = req.file;

  let msg = {
    to: to.split(",").map((email) => email.trim()),
    // to: to.split(","),
    // to: to,
    from: process.env.EMAIL_FROM,
    subject: subject,
    text: message,
  };

  // 👉 If file exists, add attachment
  if (file) {
    msg.attachments = [
      {
        content: require("fs").readFileSync(file.path).toString("base64"),
        filename: file.originalname,
        type: "application/pdf",
        disposition: "attachment",
      },
    ];
  }

  try {
    await sgMail.send(msg);

    console.log("Email sent!");

    const log = `To: ${to}, Subject: ${subject}, Message: ${message}, File: ${file ? file.originalname : "No file"}\n`;
    require("fs").appendFileSync(__dirname + "\\emails.txt", log, {
      encoding: "utf8",
    });

    res.send("Email sent successfully!");
  } catch (error) {
    console.error(error);
    res.send("Error sending email");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
