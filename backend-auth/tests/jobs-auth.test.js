const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Your Express app
const api = supertest(app);
const Job = require("../models/jobModel");
const User = require("../models/userModel");

const jobs = [
  {
    title: "Software Engineer",
    description: "Develop and maintain web applications.",
    company: {
      name: "Tech Corp",
      contactEmail: "hr@techcorp.com",
      contactPhone: "123-456-7890",
    },
  },
  {
    title: "Data Scientist",
    description: "Analyze and interpret complex data.",
    company: {
      name: "Data Inc",
      contactEmail: "hr@datainc.com",
      contactPhone: "987-654-3210",
    },
  },
  {
    title: "London in 7 Days Job",
    description: "Explore the best of London in 7 days with our expert guides.",
    image: "https://www.course-api.com/images/tours/job-2.jpeg",
    price: "2195",
  },
];
 
let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  const result = await api.post("/api/users/signup").send({
    name: "John Doe",
    email: "john@example.com",
    password: "R3g5T7#gh",
    phone_number: "1234567890",
    gender: "Male",
    date_of_birth: "1990-01-01",
    membership_status: "Inactive",
  });
  token = result.body.token;
});

describe("Given there are initially some jobs saved", () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Promise.all([
      api
        .post("/api/jobs")
        .set("Authorization", "bearer " + token)
        .send(jobs[0]),
      api
        .post("/api/jobs")
        .set("Authorization", "bearer " + token)
        .send(jobs[1]),
    ]);
  });

  it("should return all jobs as JSON when GET /api/jobs is called", async () => {
    await api
      .get("/api/jobs")
      .set("Authorization", "bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should create one job when POST /api/jobs is called", async () => {
    const newTour = {
      name: "Paris in 3 Days Job",
      info: "Experience the beauty of Paris in just 3 days.",
      image: "https://www.course-api.com/images/tours/job-3.jpeg",
      price: "1500",
    };
    await api
      .post("/api/jobs")
      .set("Authorization", "bearer " + token)
      .expect("Content-Type", /application\/json/)
      .send(newTour)
      .expect(201);
  });

  it("should return one job by ID when GET /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .set("Authorization", "bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should update one job by ID when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const updatedTour = {
      info: "Updated job information.",
      salary: 2000,
    };
    const response = await api
      .put(`/api/jobs/${job._id}`)
      .set("Authorization", "bearer " + token)
      .send(updatedTour)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  
    console.log("Response body:", response.body);
  
    const updatedTourCheck = await Job.findById(job._id);
    console.log("Updated job:", updatedTourCheck);
  
    expect(updatedTourCheck.info).toBe(updatedTour.info);
    expect(updatedTourCheck.price).toBe(updatedTour.price);
  });
  

  it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .delete("/api/jobs/" + job._id)
      .set("Authorization", "bearer " + token)
      .expect(204);
    const tourCheck = await Job.findById(job._id);
    expect(tourCheck).toBeNull();
  });
});

afterAll(() => {
  mongoose.connection.close();
});
