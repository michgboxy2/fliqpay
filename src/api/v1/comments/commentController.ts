import express, { Request, Response, NextFunction } from "express";
import { User } from "../auth/userModel";
import { Comment } from "./commentModel";
import { Ticket, TicketDoc } from "../ticket/ticketModel";
import { UserRoles } from "../services/userRoles";

const updateSupportStatus = async (ticket: TicketDoc) => {
  ticket.set({
    supportStatus: true,
  });

  await ticket.save();
};

const checkUserAccess = async (
  user: any,
  ticket: TicketDoc,
  res: Response,
  req: Request
) => {
  if (user.role === UserRoles.User) {
    if (ticket.user != req.currentUser!.id) {
      console.log(typeof ticket.user, typeof req.currentUser!.id);
      return res
        .status(401)
        .send({ message: "you can only comment on tickets raised by you" });
    }
  }
};

export const makeComment = async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;
    const { ticketId } = req.params;
    let user = await User.findById(req.currentUser!.id);
    let ticket = await Ticket.findById(ticketId);

    if (!ticketId) {
      return res.status(400).send({ message: "TicketId is required" });
    }

    if (!user) {
      return res.status(404).send({ message: "user does not exist" });
    }

    if (!ticket) {
      return res.status(404).send({ message: "ticket does not exist" });
    }

    //check if the logged in user raised the ticket
    checkUserAccess(user, ticket, res, req);

    ///Build up comment model
    const commentObj = Comment.build({
      comment,
      ticket: ticketId,
      user: user!.id,
      userRole: user!.role,
      createdAt: new Date(),
    });

    //save comment document
    await commentObj.save();

    //update ticket status to give access to a user to comment.
    user.role === UserRoles.Support ? await updateSupportStatus(ticket) : null;

    res.status(201).send(commentObj);
  } catch (e) {
    return res.status(422).send({ message: "something went wrong" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).send({ message: "TicketId is required" });
    }

    let ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).send({ message: "ticket does not exist" });
    }
    let comments = await Comment.find({ ticket: ticketId }).populate("user");

    res.status(200).send(comments);
  } catch (e) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const editComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "TicketId is required" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(400).send({ message: "comment not found" });
    }
    comment.set(req.body);

    await comment.save();

    res.send(comment);
  } catch (e) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let comment = await Comment.findById(id);

    if (!comment) {
      return res.status(400).send({ message: "comment not found" });
    }

    res.send(comment);
  } catch (e) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "TicketId is required" });
    }

    let comment = await Comment.findByIdAndDelete(id);

    res.send(comment);
  } catch (e) {
    return res.status(400).send({ message: "something went wrong" });
  }
};
