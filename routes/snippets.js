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

/*
router.post("/update/:id", checkAuth, (req, res) => {
    // check if the snippet was created by the user who is logged in and update the snippet with the new data from the request body
    Snippet.findOne({
        _id: req.params.id,
        userId: req.userData.userId,
    })
        .then((snippet) => {
            if (!snippet) {
                return res.status(400).json({
                    message: "You don't have a snippet with this ID",
                });
            }

            if (req.body.title) {
                Snippet.findOne(
                    {
                        title: req.body.title,
                        userId: req.userData.userId,
                    },
                    (titleCheckErr, titleCheckSnippet) => {
                        if (titleCheckErr) {
                            return res.status(500).json({
                                error: titleCheckErr,
                            });
                            return;
                        }
                        return res.status(400).json({
                                message:
                                    "You already have a snippet with that title",
                        
                    })
                );

                snippet.title = req.body.title;
            }
            snippet.description = req.body.description;
            snippet.code = req.body.code;
            snippet.language = req.body.language;

            // save the snippet
            snippet.save((saveSnippetErr, saveSnippet) => {
                if (saveSnippetErr) {
                    return res.status(500).json({
                        error: saveSnippetErr,
                    });
                } else {
                    return res.status(201).json({
                        message: "Snippet updated",
                        snippet: saveSnippet,
                    });
                }
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
            });
        });
});
*/
/*
// Fetch ALL snippets
// /api/snippets/all/
// /api/snippets/all/?limit=10&page=0
// 0 is first page
router.get("/all", async (req, res) => {
    if (req.query.limit) {
        let page = parseInt(req.query.page, 10) || 0;
        let limit = parseInt(req.query.limit, 10) || 10;

        await Snippet.find()
            .limit(limit)
            .skip(limit * page)
            .sort({ _id: -1 })
            .then((snippets) => {
                if (snippets) {
                    // Return fetched snippets
                    const response = {
                        message: "Success fetching snippets",
                        snippets: snippets,
                    };

                    return res.status(200).json(response);
                } else {
                    // No snippets found
                    return res
                        .status(404)
                        .json({ message: "No snippets found." });
                }
            })
            .catch((error) => {
                // Error
                return res.status(500).json({
                    message: "Error fetching all snippets.",
                    error: error,
                });
            });
    } else {
        // fetch snippets sort by id
        await Snippet.find()
            .sort({ _id: -1 })
            .then((snippets) => {
                if (snippets) {
                    // Return fetched snippets
                    const response = {
                        message: "Success fetching snippets",
                        snippets: snippets,
                    };

                    return res.status(200).json(response);
                } else {
                    // No snippets found
                    return res
                        .status(404)
                        .json({ message: "No snippets found." });
                }
            })
            .catch((error) => {
                // Error
                return res.status(500).json({
                    message: "Error fetching all snippets.",
                    error: error,
                });
            });
    }
});

// Fetch ALL User snippets
// /api/snippets/alluser/:creator
// /api/snippets/alluser/:creator?limit=10&page=0
// 0 is first page
router.get("/alluser/:creator", async (req, res) => {
    if (req.query.limit) {
        let page = parseInt(req.query.page, 10) || 0;
        let limit = parseInt(req.query.limit, 10) || 10;

        await Snippet.find({ creator: req.params.creator })
            .limit(limit)
            .skip(limit * page)
            .sort({ _id: -1 })
            .then((snippets) => {
                if (snippets) {
                    // Return fetched snippets
                    const response = {
                        message: "Success fetching snippets",
                        snippets: snippets,
                    };

                    return res.status(200).json(response);
                } else {
                    // No snippets found
                    return res
                        .status(404)
                        .json({ message: "No snippets found." });
                }
            })
            .catch((error) => {
                // Error
                return res.status(500).json({
                    message: "Error fetching all snippets.",
                    error: error,
                });
            });
    } else {
        // fetch snippets sort by id
        await Snippet.find({ creator: req.params.creator })
            .sort({ _id: -1 })
            .then((snippets) => {
                if (snippets) {
                    // Return fetched snippets
                    const response = {
                        message: "Success fetching snippets",
                        snippets: snippets,
                    };

                    return res.status(200).json(response);
                } else {
                    // No snippets found
                    return res
                        .status(404)
                        .json({ message: "No snippets found." });
                }
            })
            .catch((error) => {
                // Error
                return res.status(500).json({
                    message: "Error fetching all snippets.",
                    error: error,
                });
            });
    }
});

// Fetch a single snippet
router.get("/:creator/:title", async (req, res) => {
    // find a single document in the snippets collection by title and creator
    Snippet.findOne(
        { title: req.params.title, creator: req.params.creator },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            if (!snippet) {
                return res.status(404).json({
                    message: "Snippet not found",
                });
            }
            return res.status(200).json({
                message: "Fetched snippet",
                snippet: snippet,
            });
        }
    );
});

// Create a snippet
router.post("/create", checkAuth, async (req, res) => {
    // create a new document in the snippets collection with the data from the request body
    const newSnippet = new Snippet({
        title: req.body.title,
        code: req.body.code,
        description: req.body.description,
        language: req.body.language,
        creator: req.body.creator,
    });

    // find the document with the same slug and creator as the new document
    Snippet.findOne(
        { title: newSnippet.title, creator: newSnippet.creator },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            // if the document is found, return an error message
            if (snippet) {
                return res.status(400).json({
                    message: "Snippet already exists",
                });
            }
            // if the document is not found, save the new document
            newSnippet.save((err, snippet) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
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

// Delete a snippt
router.post("/delete", checkAuth, async (req, res) => {
    // find a document with the title and creator from the request body
    Snippet.findOne(
        { title: req.body.title, creator: req.body.creator },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            // if the document is found, delete it
            if (snippet) {
                snippet.remove((err, snippet) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    }
                    return res.status(200).json({
                        message: "Snippet deleted",
                    });
                });
            } else {
                return res.status(404).json({
                    message: "Snippet not found",
                });
            }
        }
    );
});

// Update a snippet
router.post("/update/:creator/:title", checkAuth, async (req, res) => {
    // find a document with the title and creator from the request body
    Snippet.findOne(
        { title: req.params.title, creator: req.params.creator },
        (err, snippet) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            // if the document is found, update it with the data from the request body
            if (snippet) {
                snippet.title = req.body.title;
                snippet.code = req.body.code;
                snippet.description = req.body.description;
                snippet.language = req.body.language;
                snippet.save((err, snippet) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    }
                    return res.status(200).json({
                        message: "Snippet updated",
                        snippet: snippet,
                    });
                });
            } else {
                return res.status(404).json({
                    message: "Snippet not found",
                });
            }
        }
    );
});
*/
module.exports = router;
