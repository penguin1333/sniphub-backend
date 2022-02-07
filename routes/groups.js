const express = require("express");
const router = express.Router();

const Snippet = require("../models/snippets");
const Group = require("../models/groups");

const checkAuth = require("../middleware/check-auth");

const getIdFromUsername = (username) => {
    return User.findOne({ username: username }).then((user) => {
        return user._id;
    });
};

// create a new group
router.post("/create", checkAuth, (req, res) => {
    // create a new group
    const newGroup = new Group({
        title: req.body.title,
        description: req.body.description,
        userId: req.userData.userId,
        snippets: req.body.snippets,
    });

    // save the group
    newGroup.save((saveGroupErr, group) => {
        if (saveGroupErr) {
            return res.status(500).json({
                error: saveGroupErr,
            });
        }
        return res.status(201).json({
            message: "Group created",
            group: group,
        });
    });
});

// fetch group from id and returns snippets inside
router.get("/:id", async (req, res) => {
    // fetch group with the id provided in the request
    try {
        let group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }

        // get all snippets from the group and get snippet from id and add to array
        let snippets = [];
        for (let snippetId of group.snippets) {
            let snippet = await Snippet.findById(snippetId);
            snippets.push(snippet);
        }

        return res.status(200).json({
            message: "Group fetched",
            group,
            snippets,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Could not fetch group",
        });
    }
});

// delete a group
router.delete("/delete/:id", checkAuth, async (req, res) => {
    // check if group was created by the user who is logged in, and delete the group
    try {
        let group = await Group.findOne({
            _id: req.params.id,
            userId: req.userData.userId,
        });
        if (!group) {
            return res.status(400).json({
                message: "Group was not found or does not belong to you",
            });
        }

        // delete group
        group.remove((deleteGroupErr, group) => {
            if (deleteGroupErr) {
                return res.status(500).json({
                    error: deleteGroupErr,
                });
            }
            return res.status(200).json({
                message: "Group deleted",
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: "Could not delete group",
        });
    }
});

// update a groups title/description
router.put("/update/:id", checkAuth, async (req, res) => {
    // check if group was created by the user who is logged in, and update the group
    try {
        let group = await Group.findOne({
            _id: req.params.id,
            userId: req.userData.userId,
        });
        if (!group) {
            return res.status(400).json({
                message: "Group was not found or does not belong to you",
            });
        }

        // update group
        group.title = req.body.title;
        group.description = req.body.description;

        group.save((saveGroupErr, group) => {
            if (saveGroupErr) {
                return res.status(500).json({
                    error: saveGroupErr,
                });
            }
            return res.status(200).json({
                message: "Group updated",
                group: group,
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: "Could not update group",
        });
    }
});

// add a snippet to a group
router.post("/add/:groupId/:snippetId", checkAuth, async (req, res) => {
    // check if group was created by the user who is logged in, and update the group
    try {
        let group = await Group.findOne({
            _id: req.params.groupId,
            userId: req.userData.userId,
        });
        if (!group) {
            return res.status(400).json({
                message: "Group was not found or does not belong to you",
            });
        }
        // check if id already exists in group.snippets
        let exists = false;
        for (let i = 0; i < group.snippets.length; i++) {
            if (group.snippets[i] == req.params.snippetId) {
                exists = true;
            }
        }
        // update group
        if (exists) {
            return res
                .status(400)
                .json({ message: "Snippet already in group" });
        } else {
            group.snippets.push(req.params.snippetId);

            group.save((saveGroupErr, group) => {
                if (saveGroupErr) {
                    return res.status(500).json({
                        error: saveGroupErr,
                    });
                }
                return res.status(200).json({
                    message: "Snippet added to group",
                    group: group,
                });
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "Could not update group",
        });
    }
});

// unadd a snippet from a group
router.delete("/unadd/:groupId/:snippetId", checkAuth, async (req, res) => {
    // check if group was created by the user who is logged in, then see if snippetId is in group.snippets, then remove id from group.snippets
    try {
        let group = await Group.findOne({
            _id: req.params.groupId,
            userId: req.userData.userId,
        });
        if (!group) {
            return res.status(400).json({
                message: "Group was not found or does not belong to you",
            });
        }
        // check if id already exists in group.snippets
        let exists = false;
        for (let i = 0; i < group.snippets.length; i++) {
            if (group.snippets[i] == req.params.snippetId) {
                exists = true;
            }
        }
        // update group
        if (exists) {
            group.snippets.splice(
                group.snippets.indexOf(req.params.snippetId),
                1
            );

            group.save((saveGroupErr, group) => {
                if (saveGroupErr) {
                    return res.status(500).json({
                        error: saveGroupErr,
                    });
                }
                return res.status(200).json({
                    message: "Snippet was removed from group",
                    group: group,
                });
            });
        } else {
            return res.status(400).json({ message: "Snippet not in group" });
        }
    } catch (err) {
        return res.status(500).json({
            message: "Could not update group",
        });
    }
});

module.exports = router;
