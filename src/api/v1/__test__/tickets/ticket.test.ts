import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../../../server/server";
import { Ticket } from "../../ticket/ticketModel";

it("has a route handler listening to /api/tickets", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 403 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns a list of all closed tickets in the last 30 days", async () => {
  const cookie = global.signin();

  await request(app)
    .get(`/api/tickets/report`)
    .set("Cookie", cookie)
    .send()
    .expect(200);
});

it("returns an error when an issue is not provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      issue: "",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);
  const issue = "bad service";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      issue,
    })
    .expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].issue).toEqual(issue);
});

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const issue = "new complaint";

  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(200);

  expect(ticketResponse.body.issue).toEqual(issue);
});

it("doesn't allow anyone that isn't support or admin to update ticket status", async () => {
  //create test user
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create ticket
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue: "random ticket",
    });

  //update ticket
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(401);
});

it("updates a ticket status", async () => {
  //create test user
  let testUser = await request(app).post("/api/users/signup").send({
    email: "user@test.com",
    password: "password",
    role: "user",
  });

  //create support ticket
  let supportUser = await request(app).post("/api/users/signup").send({
    email: "support@test.com",
    password: "password",
    role: "support",
  });

  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send({
      issue: "random ticket",
    });

  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", supportUser.get("Set-Cookie"))
    .send({
      status: "closed",
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set("Cookie", testUser.get("Set-Cookie"))
    .send()
    .expect(200);

  expect(ticketResponse.body.ticketStatus).toEqual("closed");
});

it("disallows deletion of ticket if not admin", async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      issue: "random ticket",
    });

  await request(app)
    .delete(`/api/tickets/user/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(401);

  await request(app)
    .get(`api/v1/tickets/`)
    .set("Cookie", cookie)
    .send()
    .expect(404);

  let response = await Ticket.findById(ticket.body.id);

  expect(response?.issue).toBe("random ticket");
});
