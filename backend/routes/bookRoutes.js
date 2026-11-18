const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Transaction = require("../models/Transaction");

// GET: Fetch all books
router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: Add a new book
router.post("/", async (req, res) => {
    try {
        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: Update a book
router.put("/:id", async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// DELETE: Remove a book
router.delete("/:id", async (req, res) => {
    try {
        const book = await Book.findOne({ id: req.params.id });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Check whether this book has an active loan
        const activeTransaction = await Transaction.findOne({
            bookId: book.id,
            status: { $in: ["Issued", "Overdue"] }
        });

        if (activeTransaction) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a book that is currently issued"
            });
        }

        await Book.findOneAndDelete({ id: req.params.id });

        res.json({
            success: true,
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;
