import express from "express";
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/recipes", async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query || ""}`
    );
    res.json(response.data.meals || []);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recipes" });
  }
});

app.post("/api/share", async (req, res) => {
  const { email, recipe } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"Recipe Explorer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🍲 Recipe Recommendation: ${recipe.title || recipe.strMeal}`,
      text: `
Hi! Someone thought you’d enjoy this recipe:  

${recipe.title || recipe.strMeal}  
Category: ${recipe.category || recipe.strCategory}  

Ingredients: ${
        recipe.ingredients
          ? recipe.ingredients.join(", ")
          : "Check the app for details"
      }

Instructions: ${
        recipe.instructions || recipe.strInstructions || "Check the app"
      }

Enjoy cooking!  
- Recipe Explorer
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: " Email sent!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
