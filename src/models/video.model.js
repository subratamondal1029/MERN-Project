import { Schema, model } from "mongoose";
// import mongoosePaginate from "mongoose-paginate-v2";

const videoSchema = new Schema({
    videoFile:{
        type: String, // cloudinary url
        required: true,
    },
    thumbnail:{
        type: String, // cloudinary url
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration:{
        type: Number, // cloudinary
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema)