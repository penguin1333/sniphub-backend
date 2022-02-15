const mongoose = require("mongoose");

const groupsSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        userId: {
            type: String,
            required: true,
        },
        snippets: [{ type: mongoose.Schema.ObjectId, ref: "Snippet" }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Group", groupsSchema);
