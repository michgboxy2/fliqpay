import mongoose from "mongoose";
import { TicketStatus } from "../services/ticketStatus";
import { CommentDoc, Comment } from "../comments/commentModel";

export { TicketStatus };

interface TicketAttrs {
  issue: string;
  user: string;
  created: Date;
  supportStatus: boolean;
  ticketStatus: TicketStatus;
}

export interface TicketDoc extends mongoose.Document {
  issue: string;
  user: string;
  created: Date;
  supportStatus: boolean;
  ticketStatus: TicketStatus;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attr: TicketAttrs): TicketDoc;
  getAllComments(): CommentDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created: { type: mongoose.Schema.Types.Date },
    supportStatus: { type: Boolean, default: false },
    ticketStatus: {
      type: String,
      required: true,
      enum: Object.values(TicketStatus),
      default: TicketStatus.Created,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

ticketSchema.virtual("comments", {
  ref: "comment",
  localField: "_id",
  foreignField: "ticket",
});

ticketSchema.statics.build = (attrs: TicketDoc) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
