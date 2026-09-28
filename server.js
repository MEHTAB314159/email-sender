const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const multer = require("multer");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static("public"));

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Store uploaded files in memory instead of creating uploads/.
// This avoids the ENOENT error on Vercel.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "public", "index.html"));
});

// Send email with optional PDF attachment
app.post("/send-email", upload.single("file"), async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const file = req.file;

    // Validate input
    if (!to || !subject || !message) {
      return res
        .status(400)
        .send("Please enter recipient, subject, and message.");
    }

    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
      console.error("SendGrid environment variables are missing.");
      return res
        .status(500)
        .send(
          "Email service is not configured. Please contact the administrator.",
        );
    }

    // Create email
    const msg = {
      to: to
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      from: process.env.EMAIL_FROM,
      subject: subject,
      text: message,
    };

    // Add attachment if a file was selected
    if (file) {
      msg.attachments = [
        {
          content: file.buffer.toString("base64"),
          filename: file.originalname,
          type: file.mimetype,
          disposition: "attachment",
        },
      ];
    }

    // Send email through SendGrid
    await sgMail.send(msg);

    console.log("Email sent successfully!");

    // Vercel does not provide persistent local file storage.
    // Log basic information to Vercel logs instead.
    console.log("Email history:", {
      to,
      subject,
      file: file ? file.originalname : "No file",
    });

    return res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Email error:", error.response?.body || error.message);

    return res
      .status(500)
      .send("Error sending email. Please check your email settings.");
  }
});

// Export the Express app for Vercel
module.exports = app;

// Run locally only
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
