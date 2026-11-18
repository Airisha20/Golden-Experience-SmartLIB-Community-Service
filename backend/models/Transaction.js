
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => "T" + Date.now()
        },

        bookId: {
            type: String,
            required: true
        },

        bookTitle: {
            type: String,
            required: true
        },

        memberId: {
            type: String,
            required: true
        },

        memberName: {
            type: String,
            required: true
        },

        issueDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        dueDate: {
            type: Date,
            required: true
        },

        returnDate: {
            type: Date,
            default: null
        },

        fineAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        finePaid: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["Issued", "Returned", "Overdue"],
            default: "Issued"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
