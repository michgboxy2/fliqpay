import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../../../server/server";
import { Comment } from "../../comments/commentModel";
import { Ticket, TicketStatus } from "../../ticket/ticketModel";
import { User } from "../../auth/userModel";
import { UserRoles } from "../../services/userRoles";

const buildUser = async (role: UserRoles) => {
  const user = User.build({
    email: "user@test.com",
    password: "password",
    role,
  });

  await user.save();
  return user;
};

const buildTicket = async (role: UserRoles) => {
  const user = await buildUser(role);
  const ticket = Ticket.build({
    issue: "test issue",
    user: user.id,
    created: new Date(),
    supportStatus: false,
    ticketStatus: TicketStatus.Created,
  });
};

it("has a route handler listening to /api/comments/:ticketId", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).post(`/api/comments/${id}`).send({});
  expect(response.status).not.toEqual(404);
});

it("returns a 404 if ticket is not found", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/comments/${ticketId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns all comments attached to a ticketId", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //make comment on the ticket
  await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  let response = await request(app)
    .get(`/api/comments/${ticket.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
});

it("searches comment by ID", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";
  const secondComment = "updated comment";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //comment on the ticket
  const comment = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  const response = await request(app)
    .get(`/api/comments/admin/${comment.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(200);

  expect(response.body.comment).toEqual(supportComment);
});

it("won't allow a user post a comment if support hasn't commented", async () => {
  const issue = "bad service";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //attempt to comment on the ticket before support does
  let response = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      comment: "bad service comment",
    })
    .expect(400);

  expect(response.body.message).toEqual(
    "you can't comment on a ticket before support does"
  );
});

it("customer support can comment on a ticket", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //support comment on the ticket
  let response = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    })
    .expect(201);

  expect(response.body.comment).toEqual(supportComment);
});

it("allows a user to create a comment after support has commented on it", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";
  const secondComment = "Thanks, hopeful about a quick resolution";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //support comment on the ticket
  await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  let response = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      comment: secondComment,
    })
    .expect(201);

  expect(response.body.comment).toEqual(secondComment);
});

it("Prevent ticket update if you're not an admin", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";
  const secondComment = "updated comment";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //support comment on the ticket
  const comment = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  await request(app)
    .patch(`/api/comments/admin/${comment.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      comment: secondComment,
    })
    .expect(401);
});

it("can't allow comment deletion if you're not an admin", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";
  const secondComment = "updated comment";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //support comment on the ticket
  const comment = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  await request(app)
    .delete(`/api/comments/admin/${comment.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(401);
});

it("allows admin ticket update", async () => {
  const issue = "bad service";
  const supportComment = "It's being worked on, kindly bear with us";
  const secondComment = "updated comment";

  // Create User
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "admin",
  });

  //create support user
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  //create ticket
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    });

  //support comment on the ticket
  const comment = await request(app)
    .post(`/api/comments/${ticket.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      comment: supportComment,
    });

  await request(app)
    .patch(`/api/comments/admin/${comment.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      comment: secondComment,
    })
    .expect(200);
});
