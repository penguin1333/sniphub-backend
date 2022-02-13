const mongoose = require("mongoose");

const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const snippetSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        code: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        tags: {
            type: Array,
            required: true,
            default: [
                { title: "React", color: "red" },
                { title: "HTML", color: "pink" },
            ],
        },
        language: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            slug: "title",
            slug_padding_size: 4,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Snippet", snippetSchema);
