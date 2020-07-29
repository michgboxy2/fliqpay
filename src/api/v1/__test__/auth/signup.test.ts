import request from "supertest";
import { app } from "../../../../server/server";

it("returns a 201 on successful signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "password",
      role: "admin",
    })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@testcom",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@testcom",
      password: "p",
    })
    .expect(400);
});

it("returns a 400 with missing email and password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@testcom",
    })
    .expect(400);

  await request(app)
    .post("/api/users/signup")
    .send({
      password: "test",
    })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "password",
      role: "admin",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "password",
    })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  let data = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "password",
      role: "admin",
    })
    .expect(201);

  expect(data.get("Set-Cookie")).toBeDefined();
});
