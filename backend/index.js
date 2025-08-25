const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.error("Failed to connect", err));

const credential = mongoose.model("credential", {}, "bulkmail");

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/sendMail", async (req, res) => {
  const { msg, emailList } = req.body;

  try {
    const data = await credential.find();
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "No credentials found in DB" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: data[0].toJSON().user,
        to: email,
        subject: "A message from Bulk Mail App",
        text: msg,
      });
      console.log("Email sent to:", email);
    }

    res.send(true);
  } catch (error) {
    console.error("Error:", error);
    res.send(false);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});