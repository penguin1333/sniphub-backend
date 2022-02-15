const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/users");
const Snippet = require("../models/snippets");
const Group = require("../models/groups");

const checkAuth = require("../middleware/check-auth");

/*
    Create a new group
*/
router.post("/create", checkAuth, async (req, res) => {
    // Variables for request body
    const { title, description } = req.body;
    const userId = req.userData.userId;

    // Create new group
    const newGroup = new Group({
        title: title,
        description: description,
        userId: userId,
    });

    // Save group
    const saveGroup = await newGroup.save();
    if (saveGroup) {
        return res.status(201).json({
            message: "Group created successfully",
            group: newGroup,
        });
    } else {
        return res.status(500).json({
            message: "Error saving group",
        });
    }
});

/*
    Add a snippet to a group
*/
router.post("/add/:groupId/:snippetId", checkAuth, async (req, res) => {
    // Variables for request body
    const { groupId, snippetId } = req.params;
    const userId = req.userData.userId;

    // Validate ID's
    const trimmedGroupId = groupId.trim();
    const trimmedSnippetId = snippetId.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedGroupId)) {
        return res.status(400).json({
            message: "Invalid ID",
        });
    }
    if (!mongoose.Types.ObjectId.isValid(trimmedSnippetId)) {
        return res.status(400).json({
            message: "Invalid ID",
        });
    }

    // Find group
    const group = await Group.findOne({ _id: trimmedGroupId, userId: userId });
    if (!group) {
        return res.status(404).json({
            message: "Group not found or does not belong to you",
        });
    }

    // Find snippet
    const snippet = await Snippet.findOne({ _id: trimmedSnippetId });
    if (!snippet) {
        return res.status(404).json({
            message: "Snippet not found",
        });
    }

    // Make sure snippet isn't already in group
    if (!group.snippets.includes(trimmedSnippetId)) {
        // Add snippet to group
        group.snippets.unshift(snippet);
        const saveGroup = await group.save();
        if (saveGroup) {
            return res.status(201).json({
                message: "Snippet added to group",
                group: group,
            });
        } else {
            return res.status(500).json({
                message: "Error saving group",
            });
        }
    } else {
        return res.status(409).json({
            message: "Snippet is already in group",
        });
    }
});

/*
    Remove a snippet from a group
*/
router.delete("/unadd/:groupId/:snippetId", checkAuth, async (req, res) => {
    // Variables for request body
    const { groupId, snippetId } = req.params;
    const userId = req.userData.userId;

    // Validate ID's
    const trimmedSnippetId = snippetId.trim();
    const trimmedGroupId = groupId.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedSnippetId)) {
        return res.status(400).json({
            message: "Invalid ID",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(trimmedGroupId)) {
        return res.status(400).json({
            message: "Invalid ID",
        });
    }

    // Find group
    const group = await Group.findOne({ _id: trimmedGroupId, userId: userId });
    if (!group) {
        return res.status(404).json({
            message: "Group not found or does not belong to you",
        });
    }

    // Find snippet
    const snippet = await Snippet.findOne({ _id: trimmedSnippetId });
    if (!snippet) {
        return res.status(404).json({
            message: "Snippet not found",
        });
    }

    // Make sure snippet is in group
    if (group.snippets.includes(snippetId)) {
        // Remove snippet from group
        group.snippets.splice(group.snippets.indexOf(trimmedSnippetId), 1);
        const saveGroup = await group.save();

        if (saveGroup) {
            return res.status(200).json({
                message: "Snippet removed from group",
                group: group,
            });
        } else {
            return res.status(500).json({
                message: "Error saving group",
            });
        }
    } else {
        return res.status(404).json({
            message: "Snippet is not in group",
        });
    }
});

/*
    Get snippets in a group
*/
router.get("/snippets/:groupId", checkAuth, async (req, res) => {
    // Variables for request body
    const { groupId } = req.params;
    const userId = req.userData.userId;

    // Find group
    const findGroup = await Group.findOne({
        _id: groupId,
        userId: userId,
    }).populate("snippets");
    if (!findGroup) {
        return res.status(404).json({
            message: "Group not found or does not belong to you",
        });
    }

    // Return group
    return res.status(200).json({
        message: "Group snippets retrieved successfully",
        snippets: findGroup.snippets,
    });
});

/*
    Get my groups
*/
router.get("/me", checkAuth, async (req, res) => {
    // Variables for request body
    const userId = req.userData.userId;

    // Fetch groups
    const groups = await Group.find({ userId: userId }).sort({ _id: -1 });
    if (!groups) {
        return res.status(404).json({
            message: "No groups found",
        });
    }

    // Return groups
    return res.status(200).json({
        message: "Groups retrieved successfully",
        groups: groups,
    });
});

module.exports = router;
