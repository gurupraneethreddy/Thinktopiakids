require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());

//PostgreSQL Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_keyl;";


//Nodemailer Transporter (for sending emails)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
};

//API: Home Page
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

// 📌 Student Registration API
app.post("/register", async (req, res) => {
  const { name, email, password, age, grade, parentName, parentEmail } = req.body;

  try {
    if (!name || !email || !password || !age || !grade || !parentName || !parentEmail) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Check if student email already exists
    const emailCheck = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: `Email "${email}" is already registered!` });
    }

    if (age >= 12) return res.status(400).json({ error: "Student age must be less than 12 years." });
    if (grade > 5) return res.status(400).json({ error: "Grade must be 5 or below." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📌 Ensure parent exists or create a new parent account
    const parentQuery = `
      WITH parent_data AS (
        INSERT INTO parents (name, email, password)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      )
      SELECT id FROM parent_data
      UNION
      SELECT id FROM parents WHERE email = $2;
    `;

    const parentResult = await pool.query(parentQuery, [parentName, parentEmail, hashedPassword]);
    if (parentResult.rows.length === 0) {
      return res.status(500).json({ error: "⚠ Error creating parent account." });
    }

    const parentId = parentResult.rows[0].id; // Get parent ID

    // 📌 Insert student with the linked parent_id
    const studentInsertQuery = `
      INSERT INTO students (name, email, password, age, grade, parent_id, avatar) 
      VALUES ($1, $2, $3, $4, $5, $6, '') RETURNING *;
    `;

    await pool.query(studentInsertQuery, [name, email, hashedPassword, age, grade, parentId]);

    res.status(201).json({ message: "🎉 Registration successful!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "⚠ Internal server error. Please try again." });
  }
});

// 📌 Student & Parent Login API with Role Restriction
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body; // Role should be either "student" or "parent"

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required!" });
    }

    let user = null;
    let table = "";

    // Validate role and query the correct table
    if (role === "student") {
      table = "students";
    } else if (role === "parent") {
      table = "parents";
    } else {
      return res.status(400).json({ error: "Invalid role. Choose 'student' or 'parent'." });
    }

    // Fetch user from the correct table
    const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Email not registered." });
    }

    user = result.rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Generate JWT token with role information
    const token = jwt.sign({ id: user.id, email: user.email, role }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful!", token, role });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




//Store OTPs Temporarily (In a Real App, Use Redis or Database)
const otpStore = {};

//API: Send OTP for Password Reset
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const userCheck = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Email not registered!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ OTP sent to your email!" });

    setTimeout(() => {
      delete otpStore[email];
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "⚠ Failed to send OTP. Try again later." });
  }
});

//API: Verify OTP and Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE students SET password = $1 WHERE email = $2", [hashedPassword, email]);

    delete otpStore[email]; 
    res.json({ message: "✅ Password reset successful! You can now log in." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "⚠ Failed to reset password." });
  }
});



//API: Get Profile Data
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

// API: Get Parent Profile Data
app.get("/parent_dashboard", authenticateToken, async (req, res) => {
  try {
    const parent = await pool.query(
      "SELECT id, name, email, avatar FROM parents WHERE id = $1",
      [req.user.id]
    );

    if (parent.rows.length === 0) {
      return res.status(404).json({ error: "Parent not found" });
    }

    res.json({ user: parent.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "⚠ Internal server error." });
  }
});


//API: Fetch Students in Parent Profile
app.get("/parent_students", authenticateToken, async (req, res) => {
  try {
      const parentId = req.user.id; // Extract parent ID from token
      const students = await pool.query(
          "SELECT id, name, email, age, grade, avatar FROM students WHERE parent_id = $1",
          [parentId]
      );

      res.json({ students: students.rows });
  } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch student details" });
  }
});

// API: For updating the student from the students
app.post("/update-profile", authenticateToken, async (req, res) => {
  const { name, age, grade, avatar } = req.body;
  const userId = req.user.id; // Assuming the user ID is extracted from the token

  try {
    const updatedUser = await pool.query(
      `UPDATE students 
       SET name = $1, age = $2, grade = $3, avatar = $4
       WHERE id = $5
       RETURNING *`,
      [name, age, grade, avatar, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ user: updatedUser.rows[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// API: Update Student Profile (for parents)
app.post("/update-student-profile", authenticateToken, async (req, res) => {
  const { studentId, name, age, grade } = req.body;
  const parentId = req.user.id; // Parent ID from the token

  try {
    // Check if the student belongs to the parent
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE id = $1 AND parent_id = $2",
      [studentId, parentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not authorized to update this student." });
    }

    // Update the student's profile
    const updatedStudent = await pool.query(
      `UPDATE students 
       SET name = $1, age = $2, grade = $3
       WHERE id = $4
       RETURNING *`,
      [name, age, grade, studentId]
    );

    if (updatedStudent.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ student: updatedStudent.rows[0] });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ error: "Failed to update student profile" });
  }
});

// API: Update Parent Profile
app.post("/update-parent-profile", authenticateToken, async (req, res) => {
  const { name, avatar } = req.body;
  const parentId = req.user.id; // Parent ID from the token

  try {
    // Update the parent's profile
    const updatedParent = await pool.query(
      `UPDATE parents 
       SET name = $1, avatar = $2
       WHERE id = $3
       RETURNING *`,
      [name, avatar, parentId]
    );

    if (updatedParent.rows.length === 0) {
      return res.status(404).json({ error: "Parent not found" });
    }

    res.json({ parent: updatedParent.rows[0] });
  } catch (error) {
    console.error("Error updating parent profile:", error);
    res.status(500).json({ error: "Failed to update parent profile" });
  }
});

//API: Fetch All Quizzes
app.get("/quizzes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes ORDER BY created_at DESC");
    res.json({ quizzes: result.rows });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "⚠ Internal server error. Failed to load quizzes." });
  }
});

// API: Get 10 Random Questions for a Specific Quiz Based on Student Grade
app.get("/quiz/start/:quiz_id/:student_id", async (req, res) => {
  const { quiz_id, student_id } = req.params;

  try {
    // 1️⃣ Fetch the student's grade from the students table
    const studentResult = await pool.query("SELECT grade FROM students WHERE id = $1", [student_id]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    const studentGrade = studentResult.rows[0].grade;

    // 2️⃣ Fetch 10 random questions that match the student's grade and quiz_id
    const questionsResult = await pool.query(
      "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = $1 AND grade = $2 ORDER BY RANDOM() LIMIT 10",
      [quiz_id, studentGrade]
    );

    res.json({ questions: questionsResult.rows });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


//API: Submit Quiz Answers and Return Score with Feedback
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


//API: Inserting the score and no of attempts to the quiz_attempts table
app.post("/submit-quiz", async (req, res) => {
  try {
    console.log("Request Body:", req.body); 
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



//API: Fetch Progress Data (Latest Scores, Highest Scores & Total Attempts)
app.get("/progress", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const latestScoresQuery = await pool.query(
      `SELECT qa.quiz_id, q.title AS quiz_name, qa.score
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = $1
       AND qa.attempt_number = (
         SELECT MAX(sub.attempt_number)
         FROM quiz_attempts sub
         WHERE sub.student_id = $1 AND sub.quiz_id = qa.quiz_id
       )
       ORDER BY q.title ASC`,
      [userId]
    );

    const highestScoresQuery = await pool.query(
      `SELECT quiz_id, MAX(score) AS highest_score
       FROM quiz_attempts
       WHERE student_id = $1
       GROUP BY quiz_id`,
      [userId]
    );

    const totalAttemptsQuery = await pool.query(
      `SELECT quiz_id, COUNT(*) AS total_attempts
       FROM quiz_attempts
       WHERE student_id = $1
       GROUP BY quiz_id`,
      [userId]
    );

    const attemptsMap = {};
    totalAttemptsQuery.rows.forEach((row) => {
      attemptsMap[row.quiz_id] = row.total_attempts;
    });

    const highestScoresMap = {};
    highestScoresQuery.rows.forEach((row) => {
      highestScoresMap[row.quiz_id] = row.highest_score;
    });

    const progressData = latestScoresQuery.rows.map((row) => ({
      quiz_id: row.quiz_id,
      quiz_name: row.quiz_name,
      latestScore: row.score,
      highestScore: highestScoresMap[row.quiz_id] || row.score, 
      totalAttempts: attemptsMap[row.quiz_id] || 0, 
    }));

    res.json({ progress: progressData });
  } catch (error) {
    console.error("Error fetching progress data:", error);
    res.status(500).json({ error: "⚠ Failed to fetch progress data." });
  }
});



// API: Fetch Quiz Scores for a Child
app.get("/child_quiz_scores", authenticateToken, async (req, res) => {
  const { studentId } = req.query; // Child ID from the query parameters
  const parentId = req.user.id; // Parent ID from the token

  try {
    // Check if the child belongs to the parent
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE id = $1 AND parent_id = $2",
      [studentId, parentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not authorized to view this child's data." });
    }

    // Fetch quiz scores for the child
    const quizScores = await pool.query(
      `SELECT qa.id, qa.quiz_id, q.title AS quiz_name, qa.score, qa.attempt_date, qa.attempt_number
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = $1
       ORDER BY qa.attempt_date DESC`,
      [studentId]
    );

    res.json({ quizScores: quizScores.rows });
  } catch (error) {
    console.error("Error fetching quiz scores:", error);
    res.status(500).json({ error: "Failed to fetch quiz scores" });
  }
});




// API: For comparing the student
app.get("/compare_students", authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id; // Extract parent ID from token

    // Fetch all students under this parent
    const students = await pool.query(
      "SELECT id, name FROM students WHERE parent_id = $1",
      [parentId]
    );

    if (students.rows.length === 0) {
      return res.json({ students: [] });
    }

    // Fetch quiz scores & attempts for each student (combined and subject-wise)
    const studentData = await Promise.all(
      students.rows.map(async (student) => {
        // Combined scores and attempts
        const combinedResults = await pool.query(
          `SELECT AVG(score) AS average_score, COUNT(*) AS quiz_attempts 
           FROM quiz_attempts 
           WHERE student_id = $1`,
          [student.id]
        );

        // Subject-wise scores and attempts
        const subjectResults = await pool.query(
          `SELECT q.title AS subject, AVG(qa.score) AS average_score, COUNT(*) AS quiz_attempts 
           FROM quiz_attempts qa
           JOIN quizzes q ON qa.quiz_id = q.id
           WHERE qa.student_id = $1
           GROUP BY q.title`,
          [student.id]
        );

        return {
          name: student.name,
          combined: {
            average_score: combinedResults.rows[0]?.average_score || 0,
            quiz_attempts: combinedResults.rows[0]?.quiz_attempts || 0,
          },
          subjects: subjectResults.rows.map((row) => ({
            subject: row.subject,
            average_score: row.average_score || 0,
            quiz_attempts: row.quiz_attempts || 0,
          })),
        };
      })
    );

    res.json({ students: studentData });
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.log("Decoded User:", user);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token." });
  }

  let userGrade = user.grade; // Extract grade from token
  const { subject } = req.params;
  console.log("Route hit for subject:", subject);
  console.log("User Grade from token:", userGrade);

  // If grade is missing in the token, fetch it from the database
  if (!userGrade) {
    try {
      const gradeQuery = "SELECT grade FROM students WHERE id = $1";
      const gradeResult = await pool.query(gradeQuery, [user.id]);

      if (gradeResult.rows.length > 0) {
        userGrade = gradeResult.rows[0].grade;
        console.log("User Grade from database:", userGrade);
      } else {
        return res.status(404).json({ error: "User grade not found in database." });
      }
    } catch (error) {
      console.error("Database error (Fetching user grade):", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

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

    console.log("Fetched audiobooks:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No audiobooks found." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Database error (Fetching audiobooks):", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


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
  console.log("Fetching bookmarks for audiobook:", audiobookId, "and student:", studentId);
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


// Submit game score - Always insert new record for each attempt
app.post("/game/submit", authenticateToken, async (req, res) => {
  try {
    const { subject_id, game_id, score } = req.body;
    const student_id = req.user.id;

    // Validate request body
    if (!student_id || !subject_id || !game_id || score === undefined) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (typeof score !== 'number' || isNaN(score)) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const client = await pool.connect();
    try {
      // Get next attempt number
      const attemptResult = await client.query(
        `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt 
         FROM game_scores 
         WHERE student_id = $1 AND subject_id = $2 AND game_id = $3`,
        [student_id, subject_id, game_id]
      );

      const nextAttempt = attemptResult.rows[0].next_attempt;

      // Insert new record
      await client.query(
        `INSERT INTO game_scores 
         (student_id, subject_id, game_id, score, attempt_number, attempt_timestamp)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [student_id, subject_id, game_id, score, nextAttempt]
      );

      res.json({ success: true });

    } catch (error) {
      // Handle specific errors without exposing details
      if (error.code === '23505') {
        return res.status(409).json({ error: "Duplicate entry" });
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    // Generic error response
    res.status(500).json({ error: "Operation failed" });
  }
});


// API: Fetch Game Scores for a Child
app.get("/child_game_scores", authenticateToken, async (req, res) => {
  const { studentId } = req.query; // Child ID from the query parameters
  const parentId = req.user.id; // Parent ID from the token

  try {
    // Check if the child belongs to the parent
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE id = $1 AND parent_id = $2",
      [studentId, parentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not authorized to view this child's data." });
    }

    // Fetch game scores for the child with subject name from game_subjects
    const gameScores = await pool.query(
      `SELECT gs.id, gs.student_id, gs.subject_id, gs.game_id, gs.score, gs.attempt_timestamp, gs.attempt_number, 
              sub.subject_name
       FROM game_scores gs
       JOIN game_subjects sub ON gs.subject_id = sub.id
       WHERE gs.student_id = $1
       ORDER BY gs.attempt_timestamp DESC`,
      [studentId]
    );

    res.json({ gameScores: gameScores.rows });
  } catch (error) {
    console.error("Error fetching game scores:", error);
    res.status(500).json({ error: "Failed to fetch game scores" });
  }
});


// API: Compare Students' Game Performance
app.get("/compare_students_games", authenticateToken, async (req, res) => {
  const parentId = req.user.id;

  try {
    // Fetch students under the parent
    const studentsResult = await pool.query(
      "SELECT id, name FROM students WHERE parent_id = $1",
      [parentId]
    );
    const students = studentsResult.rows;

    // Fetch all available game subjects
    const subjectsResult = await pool.query(
      "SELECT id, subject_name FROM game_subjects ORDER BY subject_name"
    );
    const allSubjects = subjectsResult.rows;

    const comparisonData = { 
      students: [],
      subjects: allSubjects.map(sub => sub.subject_name) // Send all available subjects to frontend
    };

    for (const student of students) {
      // Fetch combined game scores
      const combinedResult = await pool.query(
        `SELECT AVG(score) as average_score, COUNT(*) as quiz_attempts
         FROM game_scores
         WHERE student_id = $1`,
        [student.id]
      );
      const combined = combinedResult.rows[0];

      // Fetch subject-wise game scores for this student
      const subjectsDataResult = await pool.query(
        `SELECT gs.subject_id, sub.subject_name as subject, 
                AVG(gs.score) as average_score, COUNT(*) as quiz_attempts
         FROM game_scores gs
         JOIN game_subjects sub ON gs.subject_id = sub.id
         WHERE gs.student_id = $1
         GROUP BY gs.subject_id, sub.subject_name`,
        [student.id]
      );
      const subjectsData = subjectsDataResult.rows;

      // Create subject entries for all possible subjects, with 0 values if no data
      const subjects = allSubjects.map(subject => {
        const studentSubject = subjectsData.find(s => s.subject_id === subject.id);
        return {
          subject: subject.subject_name,
          average_score: studentSubject ? parseFloat(studentSubject.average_score).toFixed(2) : "0.00",
          quiz_attempts: studentSubject ? parseInt(studentSubject.quiz_attempts) : 0
        };
      });

      comparisonData.students.push({
        id: student.id,
        name: student.name,
        combined: {
          average_score: combined.average_score ? parseFloat(combined.average_score).toFixed(2) : "0.00",
          quiz_attempts: parseInt(combined.quiz_attempts) || 0,
        },
        subjects: subjects
      });
    }

    res.json(comparisonData);
  } catch (error) {
    console.error("Error fetching game comparison data:", error);
    res.status(500).json({ error: "Failed to fetch game comparison data" });
  }
});



// API: Fetch Weekly Quiz Progress for a Student
app.get("/weekly_progress", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const weeklyProgressQuery = await pool.query(
      `SELECT 
         EXTRACT(DOW FROM attempt_date) AS day_number,
         TO_CHAR(attempt_date, 'Dy') AS day,
         AVG(score) AS score
       FROM quiz_attempts
       WHERE student_id = $1
       AND attempt_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY EXTRACT(DOW FROM attempt_date), TO_CHAR(attempt_date, 'Dy')
       ORDER BY day_number ASC`,
      [userId]
    );

    // Map day numbers to ensure all days are represented (0 = Sun, 6 = Sat)
    const daysOfWeek = [
      { day: "Sun", score: 0 },
      { day: "Mon", score: 0 },
      { day: "Tue", score: 0 },
      { day: "Wed", score: 0 },
      { day: "Thu", score: 0 },
      { day: "Fri", score: 0 },
      { day: "Sat", score: 0 },
    ];

    weeklyProgressQuery.rows.forEach((row) => {
      const dayIndex = parseInt(row.day_number); // 0 = Sunday, 6 = Saturday
      daysOfWeek[dayIndex] = { day: row.day, score: parseFloat(row.score).toFixed(1) };
    });

    res.json({ weeklyProgress: daysOfWeek });
  } catch (error) {
    console.error("Error fetching weekly progress:", error);
    res.status(500).json({ error: "⚠ Failed to fetch weekly progress data." });
  }
});

// API: Fetch Game Scores by Subject for a Student
app.get("/game_scores_by_subject", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch game scores with subject names
    const gameScoresQuery = await pool.query(
      `SELECT 
         gs.subject_id,
         sub.subject_name,
         AVG(gs.score) AS avg_score,
         MAX(gs.score) AS highest_score,
         COUNT(*) AS total_attempts
       FROM game_scores gs
       JOIN game_subjects sub ON gs.subject_id = sub.id
       WHERE gs.student_id = $1
       GROUP BY gs.subject_id, sub.subject_name
       ORDER BY sub.subject_name ASC`,
      [userId]
    );

    const subjectProgress = gameScoresQuery.rows.map((row) => ({
      subjectId: row.subject_id,
      subject: row.subject_name,
      avgScore: parseFloat(row.avg_score).toFixed(1),
      highestScore: parseFloat(row.highest_score),
      totalAttempts: parseInt(row.total_attempts),
    }));

    // Fetch historical data for progress over time (e.g., by month)
    const historicalQuery = await pool.query(
      `SELECT 
         TO_CHAR(attempt_timestamp, 'Mon') AS month,
         sub.subject_name,
         AVG(gs.score) AS score
       FROM game_scores gs
       JOIN game_subjects sub ON gs.subject_id = sub.id
       WHERE gs.student_id = $1
       AND attempt_timestamp >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(attempt_timestamp, 'Mon'), sub.subject_name
       ORDER BY MIN(attempt_timestamp) ASC`,
      [userId]
    );

    res.json({
      subjectProgress,
      historicalProgress: historicalQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching game scores by subject:", error);
    res.status(500).json({ error: "⚠ Failed to fetch game scores data." });
  }
});




//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
