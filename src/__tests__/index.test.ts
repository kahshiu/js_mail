import app from "../index";
import request from "supertest";
import supertest from "supertest";

beforeAll(done => {
	done()
})

afterAll(done => {
	// Closing the DB connection allows Jest to exit successfully.
	// mongoose.connection.close()
	done()
})

describe("GET / - the home endpoint", function () {
	it("Hello API Request", async () => {
		const result = await request(app).get("/");
		expect(result.text).toEqual("service is running");
		expect(result.statusCode).toEqual(200);
	});
})

test("POST /mail - the mailer endpoint", async () => {
	await supertest(app)
		.post("/mail")
		.expect(401)
})

test("POST /mail - the mailer endpoint", async () => {
	await supertest(app)
		.post("/mail")
		.send({
			"test": 1,
			"anotehr": 123,
			"apiToken": "helloPassword"
		})
		.expect(200)
		.then((response) => {
			expect(response.body.message).toEqual("email sent");
		})
})