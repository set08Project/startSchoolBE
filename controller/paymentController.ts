import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import paymentModel from "../model/paymentModel";
import { Types } from "mongoose";
import moment from "moment";
import crypto from "crypto";
import { CronJob } from "cron";
import axios from "axios";
import https from "https";
import env from "dotenv";
env.config();

export const createPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    // const { cost, schoolName, expiryDate, datePaid, paymentID } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const startDate = new Date();
      const startedDate = new Date().setTime(startDate.getTime());
      // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
      const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);

      const paymentID = crypto.randomBytes(3).toString("hex");

      const payments = await paymentModel.create({
        cost: 200000,
        schoolName: school?.schoolName,
        expiryDate: moment(dataPeriod).format("LLLL"),
        datePaid: moment(startedDate).format("LLLL"),
        paymentID,
      });

      school.payments.push(new Types.ObjectId(payments._id));
      school.save();

      await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          plan: "active",
        },
        { new: true }
      );

      // const timer = setTimeout(async () => {
      //   console.log("work out this...!");
      //   await schoolModel.findByIdAndUpdate(
      //     schoolID,
      //     {
      //       plan: "in active",
      //     },
      //     { new: true }
      //   );
      //   clearTimeout(timer);
      // }, 1000 * 60);

      return res.status(201).json({
        message: "payment created successfully",
        data: school,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const makePaymentWithCron = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const startDate = new Date();
      const startedDate = new Date().setTime(startDate.getTime());
      // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
      const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);

      const paymentID = crypto.randomBytes(3).toString("hex");

      const payments = await paymentModel.create({
        cost: 200000,
        schoolName: school?.schoolName,
        expiryDate: moment(dataPeriod).format("LLLL"),
        datePaid: moment(startedDate).format("LLLL"),
        paymentID,
      });

      school.payments.push(new Types.ObjectId(payments._id));
      school.save();

      await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          plan: "active",
        },
        { new: true }
      );

      const timer = setTimeout(async () => {
        console.log("work out this...!");
        await schoolModel.findByIdAndUpdate(
          schoolID,
          {
            plan: "in active",
          },
          { new: true }
        );
        clearTimeout(timer);
      }, 1000 * 60);

      // const cronParser = require("cron-parser");

      return res.status(201).json({
        message: "payment created successfully",
        data: school,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const viewSchoolPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID).populate({
      path: "payments",
    });

    return res.status(200).json({
      message: "viewing school payments",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school payments",
    });
  }
};

export const makeSchoolPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      CronJob;
    }

    return res.status(200).json({
      message: "viewing school payments",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school payments",
    });
  }
};

export const makePayment = async (req: Request, res: Response) => {
  try {
    const { amount, email } = req.body;

    const params = JSON.stringify({
      email,
      amount: (parseInt(amount) * 100).toString(),
      callback_url: `${process.env.APP_URL_DEPLOY}`,
      metadata: {
        cancel_action: "http://localhost:5173/",
      },
      channels: ["card"],
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
        "Content-Type": "application/json",
      },
    };

    const request = https
      .request(options, (response: any) => {
        let data = "";

        response.on("data", (chunk: any) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(201).json({
            message: "processing payment",
            data: JSON.parse(data),
            status: 201,
          });
        });
      })
      .on("error", (error: any) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error: any) {
    return res.status(404).json({
      message: "Error",
      data: error.message,
      status: 404,
    });
  }
};

export const viewVerifyTransaction = async (req: Request, res: Response) => {
  try {
    const { ref } = req.params;
    console.log(ref);

    await axios
      .get(`https://api.paystack.co/transaction/verify/${ref}`, {
        headers: {
          authorization: `Bearer ${process.env.APP_PAYSTACK}`,

          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      })
      .then((resp: any) => {
        return res.status(201).json({
          message: "welcome",
          data: resp.data,
          status: 201,
        });
      });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error",
      data: error.message,
      error: error,
      status: 404,
    });
  }
};

export const paymentFromStore = (req: Request, res: Response) => {
  try {
    const { account } = req.body;

    const params = JSON.stringify({
      email: "customer@email.com",
      amount: "20000",
      subaccount: account,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
        "Content-Type": "application/json",
      },
    };

    const request = https
      .request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(JSON.parse(data));
        });
      })
      .on("error", (error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error) {
    res.status(404).json({
      message: "Error",
      status: 404,
    });
  }
};

export const createPaymentAccount = (req: Request, res: Response) => {
  try {
    const { account } = req.body;

    const params = JSON.stringify({
      // business_name: "Cheese Sticks",
      // bank_code: "058",
      account_number: "2254710854",
      percentage_charge: 20,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/subaccount",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
        "Content-Type": "application/json",
      },
    };

    const request = https
      .request(options, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          res.status(200).json({
            message: "gotten",
            data: JSON.parse(data),
            status: 200,
          });
        });
      })
      .on("error", (error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error) {
    res.status(404).json({
      message: "Error",
      status: 404,
    });
  }
};

export const getBankAccount = (req: Request, res: Response) => {
  try {
    const { account } = req.body;

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/bank",
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
      },
    };

    https
      .request(options, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          res.status(200).json({
            message: "gotten",
            data: JSON.parse(data),
            status: 200,
          });
        });
      })
      .on("error", (error) => {
        console.error(error);
      });
  } catch (error) {
    res.status(404).json({
      message: "Error",
      status: 404,
    });
  }
};
