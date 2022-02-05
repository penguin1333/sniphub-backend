const express = require("express");
const router = express.Router();
const Snippet = require("../models/snippets");
const User = require("../models/users");
const checkAuth = require("../middleware/check-auth");

const getIdFromUsername = (username) => {
    return User.findOne({ username: username }).then((user) => {
        return user._id;
    });
};

router.post("/create", checkAuth, (req, res) => {
    // check if snippet already exists
    Snippet.findOne(
        { title: req.body.title, userId: req.userData.userId },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            if (snippet) {
                return res.status(400).json({
                    message: "Snippet already exists",
                });
            }

            // create a new snippet
            const newSnippet = new Snippet({
                title: req.body.title,
                description: req.body.description,
                code: req.body.code,
                userId: req.userData.userId,
                language: req.body.language,
            });

            // save the snippet
            newSnippet.save((saveSnippetErr, snippet) => {
                if (saveSnippetErr) {
                    return res.status(500).json({
                        error: saveSnippetErr,
                    });
                }
                return res.status(201).json({
                    message: "Snippet created",
                    snippet: snippet,
                });
            });
        }
    );
});

router.put("/update/:id", checkAuth, (req, res) => {
    // check if snippet was created by the user who is logged in, and update the snippet with new data from the request body
    Snippet.findOne(
        { _id: req.params.id, userId: req.userData.userId },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            if (!snippet) {
                return res.status(400).json({
                    message: "Snippet was not found or does not belong to you",
                });
            }

            // update snippet obj
            snippet.title = req.body.title;
            if (req.body.description) {
                snippet.description = req.body.description;
            }
            snippet.code = req.body.code;
            snippet.language = req.body.language;

            // save the snippet
            snippet.save((saveErr, saveSnippet) => {
                if (saveErr) {
                    return res.status(500).json({
                        error: saveErr,
                    });
                }
                console.log("updated");
                return res.status(201).json({
                    message: "Snippet updated",
                    snippet: saveSnippet,
                });
            });
        }
    );
});

router.delete("/delete/:id", checkAuth, (req, res) => {
    // check if snippet was created by the user who is logged in, and delete the snippet
    Snippet.findOne(
        { _id: req.params.id, userId: req.userData.userId },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            if (!snippet) {
                return res.status(400).json({
                    message: "Snippet was not found or does not belong to you",
                });
            }

            // delete snippet
            snippet.remove((deleteErr, snippet) => {
                if (deleteErr) {
                    return res.status(500).json({
                        error: deleteErr,
                    });
                }
                return res.status(200).json({
                    message: "Snippet deleted",
                });
            });
        }
    );
});

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

router.get("/user/:username", async (req, res) => {
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

router.get("/:username/:title", async (req, res) => {
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
        return res.status(500).json({
            error: err,
        });
    }
});

module.exports = router;
