import request from "supertest";
import { app } from "../../../../server/server";

it("fails when an email that does not exist is passed", async (done) => {
  request(app)
    .post("/api/users/signin")
    .send({
      email: "test2@test.com",
      password: "password",
    })
    .expect(400)
    .end(function (err, res) {
      if (err) done(err);
      done();
    });
});

it("fails when incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "password",
      role: "admin",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test2@test.com",
      password: "passworde",
    })
    .expect(400);
});

it("responds with token with a valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
      role: "admin",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
});
