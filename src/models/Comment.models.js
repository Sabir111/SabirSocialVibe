import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentsSchema = new Schema({
    user: {
         type: Schema.Types.ObjectId, 
         ref: "User", 
         required: true 
        },
    post: {
         type: Schema.Types.ObjectId, 
         ref: "Post", 
         required: true 
        },
    text: {
         type: String, 
         required: true 
        },
    }, {timestamps: true});

commentsSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentsSchema);