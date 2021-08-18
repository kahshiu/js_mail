import express, { Request, Response, Application, NextFunction, request } from 'express';
import { createTransport } from 'nodemailer';
import env from 'dotenv';
env.config()
// console.log("tracing env: ", process.env.ENV);

const PORT = process.env.PORT || 8800;
const ENV = process.env.ENV || "DEV";
const isDev = ENV === "DEV";

const apiToken = "helloPassword";
const mailFrom = process.env.MAILFROM ?? "youremail@gmail.com";
const mailPass = process.env.MAILPASS ?? "yourpassword";
const publicRoutes = ["/"]

const app: Application = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req: Request, res: Response, next: NextFunction) {
  //console.log("tracing req", req.path)
  const isPublicRoute = publicRoutes.includes(req.path)
  const accessGranted = isPublicRoute || (!isPublicRoute && req.body.apiToken === apiToken);

  if (accessGranted) {
    next();
  } else {
    const result: messageOut = {
      message: "Unauthenticated access",
      date: new Date()
    };
    res.status(401).send(JSON.stringify(result));
  }
});

// NOTE: standardise payload shape
type messageOut = {
  message: string;
  date: Date
}

app.get("/", (req: Request, res: Response): void => {
  res.send("service is running")
});

app.post("/mail", (req: Request, res: Response): void => {
  const result: messageOut = {
    message: "Invalid parameters",
    date: new Date()
  };

  const { mailTo, mailText } = req.body;

  //NOTE: to remove in PROD
  if (isDev) {
    console.log("tracing params: ", req.query)
    console.log("tracing body: ", req.body)
  }

  // NOTE: premature exit
  // console.log("tracing mailTo: ", mailTo)
  if (mailTo === undefined) {
    res.send(JSON.stringify(result));
    return;
  }

  // NOTE: actual sending
  const transportConfig = isDev ?
    {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "someuser",
        pass: "somepassword"
      }
    } :
    { service: "gmail", auth: { user: mailFrom, pass: mailPass } };
  const transporter = createTransport(transportConfig);

  console.log("tracing transporter: ", transportConfig)

  transporter.sendMail({
    from: mailFrom,
    to: mailTo,
    subject: "Hello",
    text: mailText ?? "Hello from me",

  }, function (error, mailResult) {
    if (error) {
      console.log("tracing error: ", error)
      result.message = "email error"
    } else {
      result.message = "email sent"
    }
    res.send(result);
    return;
  })

});

app.listen(PORT, (): void => {
  console.log(`server running at http://localhost:${PORT}`);
});

export default app;
