const express = require("express");
const router = express.Router();
const Snippet = require("../models/snippets");
const User = require("../models/users");

const checkAuth = require("../middleware/check-auth");

const getIdFromUsername = async (username) => {
    let user = await User.findOne({ username: username });
    if (user) {
        return user._id;
    } else {
        return null;
    }
};

/*
    Create a new snippet
*/
router.post("/create", checkAuth, async (req, res) => {
    // Variables for request body
    const { title, description, code, language } = req.body;
    const userId = req.userData.userId;

    // Check if snippet already exists
    const snippet = await Snippet.findOne({ title: title, userId: userId });
    if (snippet) {
        return res.status(400).json({
            message: "Snippet already exists",
        });
    }

    // Create new snippet
    const newSnippet = new Snippet({
        title: title,
        description: description,
        code: code,
        language: language,
        userId: userId,
    });

    // Save snippet
    const saveSnippet = await newSnippet.save();
    if (saveSnippet) {
        return res.status(201).json({
            message: "Snippet created successfully",
            snippet: newSnippet,
        });
    } else {
        return res.status(500).json({
            message: "Error saving snippet",
        });
    }
});

/*
    Update a snippet
*/
router.put("/update/:slug", checkAuth, async (req, res) => {
    // Variables for request
    const { title, description, code, language } = req.body;
    const userId = req.userData.userId;
    const slug = req.params.slug;

    // Check if snippet exists
    const snippet = await Snippet.findOne({ slug: slug, userId: userId });
    if (!snippet) {
        return res.status(404).json({
            message: "Snippet not found or does not belong to you",
        });
    }

    // Update snippet
    const updateSnippet = await Snippet.findOneAndUpdate(
        { slug: slug, userId: userId },
        {
            title: title,
            description: description,
            code: code,
            language: language,
        },
        { new: true }
    );

    // Success/failure
    if (updateSnippet) {
        return res.status(200).json({
            message: "Snippet updated successfully",
            snippet: updateSnippet,
        });
    } else {
        return res.status(500).json({
            message: "Error updating snippet",
        });
    }
});

/*
    Delete a snippet
*/
router.delete("/delete/:slug", checkAuth, async (req, res) => {
    // Variables for request
    const userId = req.userData.userId;
    const slug = req.params.slug;

    // Check if snippet exists
    const snippet = await Snippet.findOne({ slug: slug, userId: userId });
    if (!snippet) {
        return res.status(404).json({
            message: "Snippet not found or does not belong to you",
        });
    }

    // Delete snippet
    const deleteSnippet = await Snippet.findOneAndDelete({
        slug: slug,
        userId: userId,
    });

    // Success/failure
    if (deleteSnippet) {
        return res.status(200).json({
            message: "Snippet deleted successfully",
        });
    } else {
        return res.status(500).json({
            message: "Error deleting snippet",
        });
    }
});

/*
    Get all snippets w/ pagination
*/
router.get("/all", async (req, res) => {
    // fetch all snippets
    if (req.query.page && req.query.limit) {
        let page = parseInt(req.query.page, 10) || 0;
        let limit = parseInt(req.query.limit, 10) || 10;

        try {
            const snippets = await Snippet.find({})
                .limit(limit)
                .skip(limit * page)
                .sort({ _id: -1 });

            return res.status(200).json({
                message: "Snippets fetched",
                snippets: snippets,
            });
        } catch (err) {
            return res.status(500).json({
                error: err,
            });
        }
    } else {
        try {
            const snippets = await Snippet.find({}).sort({ _id: -1 });

            return res.status(200).json({
                message: "Snippets fetched",
                snippets: snippets,
            });
        } catch (err) {
            return res.status(500).json({
                error: err,
            });
        }
    }
});

/*
    Get all snippets by user
*/
router.get("/user/:username", async (req, res) => {
    // Fetch user id from username
    const queryUserId = await getIdFromUsername(req.params.username);

    // fetch all snippets
    if (req.query.page && req.query.limit) {
        let page = parseInt(req.query.page, 10) || 0;
        let limit = parseInt(req.query.limit, 10) || 10;

        try {
            const snippets = await Snippet.find({ userId: queryUserId })
                .limit(limit)
                .skip(limit * page)
                .sort({ _id: -1 });

            return res.status(200).json({
                message: "Snippets fetched",
                snippets: snippets,
            });
        } catch (err) {
            return res.status(500).json({
                error: err,
            });
        }
    } else {
        try {
            const snippets = await Snippet.find({
                userId: queryUserId,
            }).sort({ _id: -1 });

            return res.status(200).json({
                message: "Snippets fetched",
                snippets: snippets,
            });
        } catch (err) {
            return res.status(500).json({
                error: err,
            });
        }
    }
});

/*
    Get a snippet by slug
*/
router.get("/:username/:title", async (req, res) => {
    // Fetch user id from username
    const queryUserId = await getIdFromUsername(req.params.username);

    // fetch all snippets from user
    try {
        const snippet = await Snippet.findOne({
            userId: queryUserId,
            slug: req.params.title,
        });

        if (snippet) {
            return res.status(200).json({
                message: "Snippet fetched",
                snippet: snippet,
            });
        } else {
            return res.status(404).json({
                message: "Snippet not found",
            });
        }
    } catch (err) {
        // Error
        return res.status(500).json({
            error: err,
        });
    }
});

module.exports = router;
