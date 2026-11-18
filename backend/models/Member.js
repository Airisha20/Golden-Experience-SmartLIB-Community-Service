
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => "M" + Date.now()
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Active", "Suspended"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Member", memberSchema);
