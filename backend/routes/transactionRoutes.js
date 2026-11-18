const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");

// GET: Fetch all transactions
router.get("/", async (req, res) => {
    try {
        // Automatically mark overdue transactions
        await Transaction.updateMany(
            {
                status: "Issued",
                dueDate: { $lt: new Date() }
            },
            {
                $set: { status: "Overdue" }
            }
        );

        const transactions = await Transaction.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: Issue a book
router.post("/issue", async (req, res) => {
    try {
        const { bookId, memberId, dueDate } = req.body;

        const book = await Book.findOne({ id: bookId });
        const member = await Member.findOne({ id: memberId });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        if (book.availability !== "Available") {
            return res.status(400).json({
                success: false,
                message: "Book is already issued"
            });
        }

        if (member.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Suspended members cannot borrow books"
            });
        }

        if (!dueDate || new Date(dueDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future due date"
            });
        }

        const transaction = await Transaction.create({
            bookId: book.id,
            bookTitle: book.title,
            memberId: member.id,
            memberName: member.name,
            dueDate: new Date(dueDate)
        });

        book.availability = "Issued";
        await book.save();

        res.status(201).json({
            success: true,
            message: "Book issued successfully",
            data: transaction
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: Return a book
router.put("/return/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            id: req.params.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.status === "Returned") {
            return res.status(400).json({
                success: false,
                message: "Book has already been returned"
            });
        }

        const book = await Book.findOne({
            id: transaction.bookId
        });

        const returnDate = new Date();

        const overdueDays = Math.max(
            0,
            Math.ceil(
                (returnDate - transaction.dueDate) /
                (1000 * 60 * 60 * 24)
            )
        );

        transaction.returnDate = returnDate;
        transaction.fineAmount = overdueDays * 5;
        transaction.status = "Returned";

        await transaction.save();

        if (book) {
            book.availability = "Available";
            await book.save();
        }

        res.json({
            success: true,
            message: "Book returned successfully",
            fineAmount: transaction.fineAmount,
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: Pay fine
router.put("/pay-fine/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            id: req.params.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.fineAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "No fine is pending"
            });
        }

        if (transaction.finePaid) {
            return res.status(400).json({
                success: false,
                message: "Fine has already been paid"
            });
        }

        transaction.finePaid = true;
        await transaction.save();

        res.json({
            success: true,
            message: "Fine paid successfully",
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
