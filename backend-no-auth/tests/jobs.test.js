const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Job = require("../models/jobModel");

const jobs = [
  {
    title: "Backend Developer",
    type: "Full-time",
    description:
      "We are looking for a Backend Developer to join our team. You will be responsible for designing and implementing the backend of our web application.",
    company: {
      name: "ABC Company",
      contactEmail: "2FQYK@example.com",
      contactPhone: "123-456-7890",
    },
  },
  {
    title: "Frontend Developer",
    type: "Part-time",
    description:
      "We are hiring a Frontend Developer to join our team. You will be responsible for designing and implementing the frontend of our web application.",
    company: {
      name: "XYZ Company",
      contactEmail: "2FQYK@example.com",
      contactPhone: "123-456-7890",
    },
  },
];

describe("Job Controller", () => {
  beforeAll(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  // Test get all jobs
  it("should return all jobs as JSON when GET /api/jobs is called", async () => {
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
  });

  // test post job
  it("should create a new job when POST /api/jobs is called", async () => {
    const newJob = {
      title: "Backend Developer",
      type: "Full-time",
      description:
        "We are looking for a Backend Developer to join our team. You will be responsible for designing and implementing the backend of our web application.",
      company: {
        name: "ABC Company",
        contactEmail: "2FQYK@example.com",
        contactPhone: "123-456-7890",
      },
    };

    await api
      .post("/api/jobs")
      .send(newJob)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
    const jobTitle = jobsAfterPost.map((job) => job.title);
    expect(jobTitle).toContain(newJob.title);
  });

  // test get job by id
  it("should return one job when GET /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  //test put job by id
  it("should update one job when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const updatedJob = {
      title: "Web Developer",
      type: "Full-time",
      description:
        "We are looking for a Web Developer to join our team. You will be responsible for designing and implementing the backend of our web application.",
      company: {
        name: "EFG Company",
        contactEmail: "2vgio@example.com",
        contactPhone: "123-456-7890",
      },
    };

    await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedJob)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.title).toBe(updatedJob.title);
    expect(updatedJobCheck.type).toBe(updatedJob.type);
    expect(updatedJobCheck.description).toBe(updatedJob.description);
    expect(updatedJobCheck.company.name).toBe(updatedJob.company.name);
    expect(updatedJobCheck.company.contactEmail).toBe(
      updatedJob.company.contactEmail
    );
    expect(updatedJobCheck.company.contactPhone).toBe(
      updatedJob.company.contactPhone
    );
  });

  it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
    const invalidId = "12345";
    await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
  });

  //test delete job by id
  it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`).expect(204);

    const jobCheck = await Job.findById(job._id);
    expect(jobCheck).toBeNull();
  });

  it("should return 400 for invalid job ID when DELETE /api/jobs/:id", async () => {
    const invalidId = "12345";
    await api.delete(`/api/jobs/${invalidId}`).expect(400);
  });
});
