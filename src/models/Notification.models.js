import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // jo notification paega
    actor: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // jisne action kiya
    type: { 
        type: String, 
        enum: ["follow", "like", "comment"], 
        required: true 
    },
    post: { 
        type: Schema.Types.ObjectId, 
        ref: "Post" 
    }, // optional
    isRead: { 
        type: Boolean, 
        default: false 
    },
}, {timestamps: true});

notificationSchema.plugin(mongooseAggregatePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);