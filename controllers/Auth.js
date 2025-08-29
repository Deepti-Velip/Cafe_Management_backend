import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

// Register Controller
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get all users (admin only)
// Get all users with search & filter (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, access } = req.query;

    // build query object
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, // case-insensitive search
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role; // e.g. admin / staff
    }

    if (access !== undefined) {
      query.access = access === "true"; // convert string to boolean
    }

    const users = await User.find(query).select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
};

// Update user access (true/false)
export const updateUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { access } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { access },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User access updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating access", error: err.message });
  }
};

// Update user role (admin/staff)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating role", error: err.message });
  }
};

//  Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};
