import mongoose from "mongoose";
import { TicketDoc, Ticket } from "../ticket/ticketModel";
import { UserRoles } from "../services/userRoles";

interface CommentAttrs {
  comment: string;
  ticket: string;
  // ticket: TicketDoc;
  user: string;
  userRole: string;
  createdAt: Date;
}

export interface CommentDoc extends mongoose.Document {
  user: string;
  comment: string;
  ticket: string;
  // ticket: TicketDoc;
  userRole: string;
  createdAt: Date;
}

interface CommentModel extends mongoose.Model<CommentDoc> {
  build(attrs: CommentAttrs): CommentDoc;
}

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userRole: {
      type: String,
      required: true,
      enum: Object.values(UserRoles),
    },

    createdAt: {
      type: mongoose.Schema.Types.Date,
    },

    comment: {
      type: String,
      required: true,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

commentSchema.statics.build = (attrs: CommentAttrs) => {
  return new Comment(attrs);
};

//method to check if user is allowed to make a comment

const Comment = mongoose.model<CommentDoc, CommentModel>(
  "Comment",
  commentSchema
);

export { Comment };
