// models/Table.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    table_no: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1, // must be at least 1 seat
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Table = mongoose.model("Table", tableSchema);
export default Table;
