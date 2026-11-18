
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => "B" + Date.now()
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        isbn: {
            type: String,
            default: ""
        },

        barcode: {
            type: String,
            required: true,
            unique: true
        },

        availability: {
            type: String,
            enum: ["Available", "Issued"],
            default: "Available"
        },

        cover: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);
