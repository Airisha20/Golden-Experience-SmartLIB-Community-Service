
const express = require("express");
const router = express.Router();

const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

// GET: Fetch all members
router.get("/", async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: Register a new member
router.post("/", async (req, res) => {
    try {
        const member = await Member.create(req.body);

        res.status(201).json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: Update member details or status
router.put("/:id", async (req, res) => {
    try {
        const member = await Member.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE: Remove a member
router.delete("/:id", async (req, res) => {
    try {
        const member = await Member.findOne({ id: req.params.id });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Check whether this member has an active loan
        const activeTransaction = await Transaction.findOne({
            memberId: member.id,
            status: { $in: ["Issued", "Overdue"] }
        });

        if (activeTransaction) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a member with an active book loan"
            });
        }

        await Member.findOneAndDelete({ id: req.params.id });

        res.json({
            success: true,
            message: "Member deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;
