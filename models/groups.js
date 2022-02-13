const mongooose = require("mongoose");

const groupsSchema = mongooose.Schema(
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
        snippets: {
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongooose.model("Group", groupsSchema);
