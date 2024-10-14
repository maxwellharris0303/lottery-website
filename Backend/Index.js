const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./DB/User");
const Lottery = require("./DB/Lottery");
const Schedule = require("./DB/Schedule");
const Log = require("./DB/Log");
const connectDB = require("./DB/Connect"); // MongoDB connection

const app = express();
const jwtKey = "Lottery";

// Connect to MongoDB
connectDB().then(async () => {
  // Check if "superadmin" user already exists
  const existingUser = await User.findOne({ role: "admin" });

  if (!existingUser) {
    // Create the "superadmin" user
    const hashedPassword = await bcrypt.hash("admin", 10); // Hash the password
    const superAdmin = new User({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    await superAdmin.save();
    console.log("Superadmin user created.");
  } else {
    console.log("Superadmin user already exists.");
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = valid;
      next();
    });
  } else {
    return res.status(401).json({ error: "Token is required" });
  }
};

// Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(404).json({ error: "No account found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordMatch) {
      const token = jwt.sign(
        { userId: existingUser._id, userRole: existingUser.role },
        jwtKey,
        { expiresIn: "1h" } // Token expires in 1 hour
      );
      return res.status(200).json({ user: existingUser, token });
    } else {
      return res.status(403).json({ message: "Password is incorrect" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
});

// Add-user route (anthenticated, superadmin)
app.post("/add-user", verifyToken, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { username, password, role } = req.body;

    // Ensure role is either 'admin' or 'user'
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      password: hashedPassword,
      role: role, // Assign role to the new user
    });

    await newUser.save();

    return res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add user" });
  }
});

// Delete User (authenticated, superadmin)
app.delete("/delete-user/:_id", verifyToken, async (req, res) => {
  try {
    if (req.user.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const result = await User.deleteOne({ _id: req.params._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Lottery not found" });
    }
    res.status(200).json({ message: "Lottery deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Lottery deletion failed" });
  }
});

// Get all users (authenticated, superadmin)
app.get("/users", verifyToken, async (req, res) => {
  try {
    if (req.user.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const users = await User.find({ role: "user" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Fetching lotteries failed" });
  }
});

// Add schedule (authenticated)
app.post("/add-schedule", verifyToken, async (req, res) => {
  try {
    if (req.user.userRole !== "admin") {
      res.status(403).json({ error: "Not allowed" });
    }
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(200).json({ error: "Schedule added successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//Get schedule (authenticated, admin)
app.get("/schedules", verifyToken, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Fetching lotteries failed" });
  }
});

//Delete schedule (authenticated, admin)
app.delete("/delete-schedule/:_id", verifyToken, async (req, res) => {
  if (req.user.userRole !== "admin") {
    res.status(403).json({ error: "Not allowed" });
  }
  try {
    const result = await Schedule.deleteOne({ _id: req.params._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    await Log.deleteMany({ schedule: req.params._id });
    await Lottery.deleteMany({ schedule: req.params._id });
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Schedule deletion failed" });
  }
});

// Update schedule by ID (authenticated, admin)
app.put("/update-schedule/:_id", verifyToken, async (req, res) => {
  if (req.user.userRole !== "admin") {
    res.status(403).json({ error: "Not allowed" });
  }
  try {
    // Update the lottery using the _id from params and the data from req.body
    const result = await Schedule.findByIdAndUpdate(
      req.params._id, // The ID from the URL
      req.body, // The data to update
      { new: true } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ message: "Schedule updated successfully", result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

// Get 4 lotteries
app.get("/lotteries", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

    const today = new Date().toISOString().split("T")[0];

    // Aggregation pipeline to get the latest lottery for each schedule
    const lotteries = await Lottery.find({ date: today });

    res.status(200).json(lotteries);
  } catch (error) {
    console.error("Error fetching today's lotteries:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching lotteries." });
  }
});

//Get all lotteris
app.get("/all-lotteries", verifyToken, async (req, res) => {
  try {
    // Make sure you're populating the correct field names
    const lotteries = await Lottery.find()
      .populate("schedule") // Assuming `schedule` is the field in the Lottery schema
      .populate("user")
      .sort({ created_at: -1 }); // Assuming there is a `user` field that references User model

    res.status(200).json(lotteries);
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    res.status(500).json({ error: "Fetching lotteries failed" });
  }
});

// Add lottery (authenticated)
app.post("/add-lottery", verifyToken, async (req, res) => {
  const { schedule, date, data } = req.body;

  // Validate input from the frontend
  if (!schedule || !data || !Array.isArray(data) || !date) {
    return res.status(400).json({
      message:
        "Invalid input. Please provide a valid schedule ID and data array.",
    });
  }

  try {
    // Find the latest lottery for the same schedule ID on the current day
    const existingLottery = await Lottery.findOne({
      schedule: schedule,
      date: date,
    }).exec();

    // If there is a lottery and its data matches the input, return an error
    if (existingLottery) {
      return res.status(400).json({
        message: "A lottery with the same schedule and date already exists.",
      });
    }

    // If no duplicate is found, create and save the new lottery
    const lottery = new Lottery({
      schedule,
      date,
      data,
      user: req.user.userId,
    });

    await lottery.save();

    const log = new Log({
      action: "add",
      user: req.user.userId,
      schedule: lottery.schedule,
      lottery: lottery._id,
      old_data: lottery.data,
      updated_at: Date.now(),
    });

    await log.save();

    res.status(200).json({ message: "Lottery added successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while adding the lottery.",
    });
  }
});

// Delete lottery by ID (authenticated)
app.delete("/delete-lottery/:_id", verifyToken, async (req, res) => {
  try {
    const result = await Lottery.deleteOne({ _id: req.params._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Lottery not found" });
    }
    res.status(200).json({ message: "Lottery deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Lottery deletion failed" });
  }
});

// Update lottery by ID (authenticated)
app.put("/update-lottery/:_id", verifyToken, async (req, res) => {
  try {
    const { schedule, date, data } = req.body;

    const oldLottery = await Lottery.findById(req.params._id);
    if (!oldLottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    const existingLottery = await Lottery.findOne({
      schedule,
      date,
      _id: { $ne: req.params._id },
    }).exec();

    if (existingLottery) {
      return res.status(400).json({
        message: "A lottery with the same schedule and date already exists.",
      });
    }

    const lotteryData = {
      schedule,
      date,
      data,
      user: req.user.userId,
      updated_at: Date.now(),
    };

    const result = await Lottery.findByIdAndUpdate(
      req.params._id,
      lotteryData,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    const log = new Log({
      action: "update",
      user: req.user.userId,
      lottery: req.params._id,
      schedule: result.schedule,
      old_data: oldLottery.data,
      new_data: result.data,
      updated_at: Date.now(),
    });

    await log.save();

    res.status(200).json({ message: "Lottery updated successfully", result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/logs", verifyToken, async (req, res) => {
  try {
    if (req.user.userRole !== "admin") {
      res.status(403).json({ message: "Not allowed here" });
    }
    const logs = await Log.find()
      .populate("schedule")
      .populate("user")
      .populate("lottery")
      .sort({ created_at: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Fetching logs failed" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
