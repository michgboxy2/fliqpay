import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import {
  createTicket,
  getUserTickets,
  getTicketStatus,
  updateTicketStatus,
  getAllTickets,
  getClosedTickets,
  downloadCSV,
} from "./ticketController";
import { requireAuth } from "../middlewares/require-auth";
import { currentUser } from "../middlewares/decodeToken";

const router = express.Router();

router
  .route("/")
  .post(
    currentUser,
    requireAuth,
    [body("issue").not().isEmpty().withMessage("Issue is required")],
    validateRequest,
    createTicket
  )
  .get(currentUser, requireAuth, getUserTickets);

router.route("/report").get(currentUser, requireAuth, getClosedTickets);

router.route("/all").get(getAllTickets);
router.route("/download").get(currentUser, requireAuth, downloadCSV);

router
  .route("/:ticketId")
  .get(currentUser, requireAuth, getTicketStatus)
  .patch(currentUser, requireAuth, updateTicketStatus);

export { router as ticketRouter };
