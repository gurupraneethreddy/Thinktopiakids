
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");


const app = express();
app.use(express.json());
app.use(cors());

// 📌 PostgreSQL Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_keyl;";


// 📌 Nodemailer Transporter (for sending emails)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
};

// 📌 API: Home Page
app.get("/home", async (req, res) => {
  try {
    const totalStudents = await pool.query("SELECT COUNT(*) FROM students");
    res.json({
      message: "🎉 Welcome to the Interactive Learning Platform!",
      totalStudents: totalStudents.rows[0].count,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "⚠ Internal server error." });
  }
});

// 📌 API: Register
app.post("/register", async (req, res) => {
  const { name, email, password, age, grade, parentName, parentEmail } = req.body;

  try {
    if (!name || !email || !password || !age || !grade || !parentName || !parentEmail) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const emailCheck = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: `Email "${email}" is already registered!` });
    }

    if (age >= 12) return res.status(400).json({ error: "Student age must be less than 12 years." });
    if (grade > 5) return res.status(400).json({ error: "Grade must be 5 or below." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO students (name, email, password, age, grade, parent_name, parent_email, avatar) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, '') RETURNING *`,
      [name, email, hashedPassword, age, grade, parentName, parentEmail]
    );

    res.status(201).json({ message: "🎉 Registration successful!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "⚠ Internal server error. Please try again." });
  }
});

// 📌 API: Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Email not registered." });
    }

    const student = result.rows[0];
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    console.log("User logged in:", student);

    const token = jwt.sign({ id: student.id, email: student.email, grade: student.grade }, SECRET_KEY, { expiresIn: "1h" });
    console.log(token);

    res.json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 📌 Store OTPs Temporarily (In a Real App, Use Redis or Database)
// const otpStore = {};
const otpStore = process.env.NODE_ENV === 'test' ? global.otpStore || {} : {};

// 📌 API: Send OTP for Password Reset
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const userCheck = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Email not registered!" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    // Send OTP via Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ OTP sent to your email!" });

    // OTP expires after 10 minutes
    setTimeout(() => {
      delete otpStore[email];
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "⚠ Failed to send OTP. Try again later." });
  }
});

// 📌 API: Verify OTP and Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE students SET password = $1 WHERE email = $2", [hashedPassword, email]);

    delete otpStore[email]; // Remove OTP after successful password reset
    res.json({ message: "✅ Password reset successful! You can now log in." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "⚠ Failed to reset password." });
  }
});

// 📌 API: Get Profile Data
app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, name, email, age, grade, avatar FROM students WHERE id = $1",
      [req.user.id]
    );
    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "⚠ Internal server error." });
  }
});

// 📌 API: Update Profile
app.post("/update-profile", authenticateToken, async (req, res) => {
  const { name, age, grade, avatar } = req.body;
  const userId = req.user.id;

  if (!name || !age || !grade || !avatar) {
    return res.status(400).json({ error: "All fields, including avatar, are required!" });
  }

  try {
    const result = await pool.query(
      "UPDATE students SET name = $1, age = $2, grade = $3, avatar = $4 WHERE id = $5 RETURNING *",
      [name, age, grade, avatar, userId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "User not found or update failed" });
    }

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "⚠ Failed to update profile" });
  }
});

// 📌 API: Fetch All Quizzes
app.get("/quizzes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes ORDER BY created_at DESC");
    res.json({ quizzes: result.rows });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "⚠ Internal server error. Failed to load quizzes." });
  }
});

// 📌 API: Get 10 Random Questions for a Specific Quiz
app.get("/quiz/start/:quiz_id", async (req, res) => {
  const { quiz_id } = req.params;

  try {
    const questionsResult = await pool.query(
      "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = $1 ORDER BY RANDOM() LIMIT 10",
      [quiz_id]
    );

    res.json({ questions: questionsResult.rows });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 📌 API: Submit Quiz Answers and Return Score with Feedback
app.post("/quiz/submit", async (req, res) => {
  const { answers } = req.body;
  let score = 0;
  let feedback = [];

  try {
    for (const answer of answers) {
      const result = await pool.query("SELECT correct_option FROM questions WHERE id = $1", [
        answer.question_id,
      ]);
      const correctAnswer = result.rows[0].correct_option;
      const isCorrect = answer.selected_option === correctAnswer;

      feedback.push({
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        correct_option: correctAnswer,
        is_correct: isCorrect,
      });

      if (isCorrect) {
        score++;
      }
    }

    res.json({ message: "Quiz submitted!", score, feedback });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/submit-quiz", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging log
    const { student_id, quiz_id, score } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const latestAttempt = await pool.query(
      "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2",
      [student_id, quiz_id]
    );

    const attemptNumber = latestAttempt.rows[0].next_attempt;

    await pool.query(
      "INSERT INTO quiz_attempts (student_id, quiz_id, attempt_number, score) VALUES ($1, $2, $3, $4)",
      [student_id, quiz_id, attemptNumber, score]
    );

    res.status(200).json({ message: "Quiz attempt recorded successfully" });
  } catch (err) {
    console.error("Error updating quiz attempts:", err);
    res.status(500).json({ error: "Failed to record quiz attempt" });
  }
});

app.get("/audiobooks/:subject", async (req, res) => {
  // Decode the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }

  const userGrade = user.grade;
  const { subject } = req.params;
  console.log("Route hit for subject:", subject);
  console.log("User Grade:", userGrade);

  try {
    const query = `
      SELECT * FROM audiobooks 
      WHERE grade = $1 AND subject = $2
      ORDER BY 
        CASE difficulty
          WHEN 'Easy' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Hard' THEN 3
          ELSE 4
        END ASC;
    `;
    const { rows } = await pool.query(query, [userGrade, subject]);

    console.log(rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No audiobooks found." });
    }
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// BOOKMARKS ENDPOINTS

// GET /bookmarks/:audiobookId - fetch all bookmarks for a given audiobook
app.get("/bookmarks/:audiobookId", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }
  
  const studentId = user.id; // Using the decoded user id as student id
  const { audiobookId } = req.params;
  // console.log("Fetching bookmarks for audiobook:", audiobookId, "and student:", studentId);
  try {
    const query = "SELECT * FROM bookmarks WHERE audiobook_id = $1 AND student_id = $2 ORDER BY created_at ASC;";
    const { rows } = await pool.query(query, [audiobookId, studentId]);
    return res.status(200).json({ bookmarks: rows });
  } catch (error) {
    console.error("Database error (GET bookmarks):", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST /bookmarks - add a new bookmark
app.post("/bookmarks", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }
  
  const studentId = user.id;
  const { audiobook_id, name, time } = req.body;
  if (!audiobook_id || !name || time === undefined) {
    return res.status(400).json({ error: "Missing required parameters." });
  }
  
  try {
    const query = "INSERT INTO bookmarks (audiobook_id, student_id, name, time) VALUES ($1, $2, $3, $4) RETURNING *;";
    const { rows } = await pool.query(query, [audiobook_id, studentId, name, time]);
    console.log("Bookmark added:", rows[0]);
    return res.status(201).json({ bookmark: rows[0] });
  } catch (error) {
    console.error("Database error (POST bookmark):", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /bookmarks/:id - delete a bookmark by id
app.delete("/bookmarks/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }
  
  const studentId = user.id;
  const { id } = req.params;
  try {
    const query = "DELETE FROM bookmarks WHERE id = $1 AND student_id = $2 RETURNING *;";
    const { rows, rowCount } = await pool.query(query, [id, studentId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Bookmark not found or not authorized." });
    }
    return res.status(200).json({ bookmark: rows[0] });
  } catch (error) {
    console.error("Database error (DELETE bookmark):", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST /track-duration/:audiobookId
app.post("/track-duration/:audiobookId", async (req, res) => {
  // Extract token from header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }

  // Extract student id from token and audiobook id from parameters
  const studentId = user.id; // Adjust this if your token structure is different
  const { audiobookId } = req.params;
  const { duration } = req.body; // Only duration is sent from the frontend

  if (duration === undefined) {
    return res.status(400).json({ error: "Missing duration in request body." });
  }

  try {
    // Check if there's already a record for this student and audiobook
    const existing = await pool.query(
      "SELECT * FROM track WHERE studentid = $1 AND audiobookid = $2",
      [studentId, audiobookId]
    );

    if (existing.rows.length > 0) {
      // Add new duration to the existing duration
      const updatedDuration = existing.rows[0].duration + duration;
      await pool.query(
        "UPDATE track SET duration = $1 WHERE studentid = $2 AND audiobookid = $3",
        [updatedDuration, studentId, audiobookId]
      );
      return res.status(200).json({ message: "Duration updated successfully.", duration: updatedDuration });
    } else {
      // Insert a new record
      const insertQuery = "INSERT INTO track (studentid, audiobookid, duration) VALUES ($1, $2, $3) RETURNING *;";
      const { rows } = await pool.query(insertQuery, [studentId, audiobookId, duration]);
      return res.status(201).json({ message: "New track record created successfully.", track: rows[0] });
    }
  } catch (error) {
    console.error("Database error (POST /track-duration):", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Optional: Get total duration for a student & audiobook
app.get("/track-duration/:studentid/:audiobookid", async (req, res) => {
  const { studentid, audiobookid } = req.params;
  try {
    const result = await pool.query(
      "SELECT duration FROM track WHERE studentid = $1 AND audiobookid = $2",
      [studentid, audiobookid]
    );

    if (result.rows.length > 0) {
      return res.json({ duration: result.rows[0].duration });
    } else {
      return res.json({ duration: 0 });
    }
  } catch (err) {
    console.error("Error fetching duration:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// 📌 Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
