import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema({
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { 
      type: String, 
      required: true 
    },
    caption: {
      type: String, 
      default: "" 
    },
    likesCount: { 
      type: Number, 
      default: 0 
    },
    commentsCount: {
      type: Number, 
      default: 0 
    },
}, {timestamps: true});

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);