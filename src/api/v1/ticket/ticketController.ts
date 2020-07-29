import express, { Request, Response, NextFunction } from "express";
import { Ticket, TicketStatus } from "./ticketModel";
import { UserRoles } from "../services/userRoles";
import { User } from "../auth/userModel";
import format from "date-fns/format";
import { subDays } from "date-fns";
import { createWriteStream } from "fs";
import { Parser } from "json2csv";
import fs from "fs";

export const createTicket = async (
  req: Request,
  res: Response,
  error: NextFunction
) => {
  try {
    const { issue } = req.body;

    const ticket = Ticket.build({
      issue,
      user: req.currentUser!.id,
      created: new Date(),
      supportStatus: false,
      ticketStatus: TicketStatus.Created,
    });

    await ticket.save();

    res.status(201).send(ticket);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const { page = 1 }: any = req.query;
    const limit = 10;
    const skip = page * limit - limit;
    const tickets = await Ticket.find({ user: req.currentUser!.id })
      .skip(skip)
      .limit(limit)
      .sort({ created: "desc" });

    if (!tickets) {
      return res.status(404).send({ message: "user has no tickets" });
    }

    res.status(200).send(tickets);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const getTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(404).send({ message: "ticketId is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    const user = await User.findById(req.currentUser!.id);

    if (!ticket) {
      return res.status(404).send({ message: "ticket not found" });
    }

    if (user?.role === UserRoles.User) {
      if (ticket.user !== req.currentUser!.id) {
        return res.status(400).send({ message: "You're not authorized" });
      }
    }

    res.send(ticket);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    if (!ticketId) {
      return res.status(403).send({ message: "ticketId is required" });
    }
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(400).send({ message: "You're not authorized" });
    }

    ticket.set({
      ticketStatus: status,
    });

    await ticket.save();

    res.send(ticket);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({});

    res.status(200).send(tickets);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const getClosedTickets = async (req: Request, res: Response) => {
  try {
    const lastReportDate = format(new Date(), "yyyy-MM-dd");
    const formattedReportDate = subDays(new Date(lastReportDate), 30);
    const tickets = await Ticket.find({
      ticketStatus: TicketStatus.Closed,
      created: {
        $gte: formattedReportDate,
        $lte: new Date(),
      },
    });

    res.send(tickets);
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};

export const downloadCSV = async (req: Request, res: Response) => {
  try {
    const fields = ["id", "issue", "ticketStatus", "created", "user"];
    const opts = { fields };

    const lastReportDate = format(new Date(), "yyyy-MM-dd");
    const formattedReportDate = subDays(new Date(lastReportDate), 30);
    const tickets = await Ticket.find({
      ticketStatus: TicketStatus.Closed,
      created: {
        $gte: formattedReportDate,
        $lte: new Date(),
      },
    }).populate("user");

    const parser = new Parser(opts);
    const csv = parser.parse(tickets);

    let writestream = fs.createWriteStream("report.csv");
    writestream.write(csv);

    writestream.on("finish", function () {
      console.log("file has been written");
      res.download(process.cwd() + "/report.csv");
    });

    writestream.end();

    // res.download(process.cwd() + "/report.csv");
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
};
