import { Request, Response, NextFunction } from "express";
import { UserRoles } from "../services/userRoles";
import { Ticket } from "../ticket/ticketModel";
import { User } from "../auth/userModel";

export const checkIfAllowedComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ticketId } = req.params;

  if (!ticketId) {
    return res.status(400).send({ message: "TicketId is required" });
  }

  let user = await User.findById(req.currentUser!.id);

  if (!user) {
    return res.status(404).send({ message: "user does not exist" });
  }

  if (user.role === UserRoles.User) {
    const authorization = await Ticket.findOne({
      _id: ticketId,
      supportStatus: true,
    });

    if (authorization) {
      next();
    } else {
      return res
        .status(400)
        .send({ message: "you can't comment on a ticket before support does" });
    }
  } else {
    next();
  }

  //   next();
};
