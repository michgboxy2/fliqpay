import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";

import {
  makeComment,
  getComments,
  editComments,
  deleteComment,
  getCommentById,
} from "./commentController";
import { requireAuth, checkIfAdmin } from "../middlewares/require-auth";
import { currentUser } from "../middlewares/decodeToken";
import { checkIfAllowedComment } from "../middlewares/checkIfAllowedComment";

const router = express.Router();

router
  .route("/admin/:id")
  .patch(currentUser, checkIfAdmin, editComments)
  .get(currentUser, requireAuth, getCommentById)
  .delete(currentUser, checkIfAdmin, deleteComment);

router
  .route("/:ticketId")
  .post(
    currentUser,
    requireAuth,
    checkIfAllowedComment,
    [body("comment").not().isEmpty().withMessage("comment is required")],
    validateRequest,
    makeComment
  )
  .get(currentUser, requireAuth, getComments);

export { router as commentRouter };
