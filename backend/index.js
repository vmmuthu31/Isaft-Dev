const express = require("express");
const multer = require("multer");
const pdfjs = require("pdfjs-dist/es5/build/pdf");
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();
const port = 8000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const content = await getItems(fileBuffer);
    res.json({ content });
  } catch (error) {
    res.status(500).send("Error processing PDF.");
  }
});

app.post("/create-event", async (req, res) => {
  const { eventDetails, token } = req.body;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      eventDetails,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

async function getContent(src) {
  const doc = await pdfjs.getDocument({ data: src }).promise;
  const page = await doc.getPage(1);
  return await page.getTextContent();
}

async function getItems(src) {
  const content = await getContent(src);
  const items = content.items.map((item) => item.str);
  return items;
}

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});