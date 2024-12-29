import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import paymentModel from "../model/paymentModel";
import { Types } from "mongoose";
import moment from "moment";
import crypto from "crypto";
import { CronJob } from "cron";
import axios from "axios";
import jwt from "jsonwebtoken";
// import https from "https";
import env from "dotenv";
import studentModel from "../model/studentModel";
import termModel from "../model/termModel";
import sessionModel from "../model/sessionModel";
env.config();

const URL = process.env.APP_URL_DEPLOY;
const https = require("https");

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

export const viewVerifyTransaction = async (req: Request, res: Response) => {
  try {
    const { ref } = req.params;

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
      .request(options, (res: Response) => {
        let data = "";

        res.on("data", (chunk: any) => {
          data += chunk;
        });

        res.on("end", () => {});
      })
      .on("error", (error: Error) => {
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
      .request(options, (resp: Response) => {
        let data = "";

        resp.on("data", (chunk: any) => {
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
      .on("error", (error: Error) => {
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
      .request(options, (resp: Response) => {
        let data = "";

        resp.on("data", (chunk: any) => {
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
      .on("error", (error: Error) => {
        console.error(error);
      });
  } catch (error) {
    res.status(404).json({
      message: "Error",
      status: 404,
    });
  }
};

// Perfect integration and selected...

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
        cost: school?.students.length * 1000,
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

export const makePayment = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { schoolID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    let amount = school?.students!.length! * 1000;
    let termID = school?.presentTermID;
    let token = jwt.sign({ termID }, process.env.API_SECRET_KEY as string, {
      expiresIn: "3d",
    });

    const params = JSON.stringify({
      email,
      amount: (amount * 100).toString(),
      callback_url: `${process.env.APP_URL_DEPLOY}/${token}/successful-payment`,
      metadata: {
        cancel_action: `${process.env.APP_URL_DEPLOY}`,
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

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { ref } = req.params;

    const url: string = `https://api.paystack.co/transaction/verify/${ref}`;

    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
        },
      })
      .then((data) => {
        return res.status(200).json({
          message: "payment verified",
          status: 200,
          data: data.data,
        });
      });
  } catch (error: any) {
    res.status(404).json({
      message: "Errror",
      data: error.message,
    });
  }
};

export const makeSplitPayment = async (req: Request, res: Response) => {
  try {
    const { accountName, accountNumber, accountBankCode } = req.body;

    const params = JSON.stringify({
      business_name: accountName,
      settlement_bank: accountBankCode,
      account_number: accountNumber,
      percentage_charge: 10,
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
      .request(options, (response: Response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(200).json({
            message: "sub-account created",
            status: 200,
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error: Error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing store",
    });
  }
};

export const storePayment = async (req: Request, res: Response) => {
  try {
    const { subAccountCode, email, amount } = req.body;

    const params = JSON.stringify({
      email,
      amount: `${amount * 100}`,
      subaccount: subAccountCode,
      callback_url: `${URL}/purchase-history`,
      meta: {
        cancel: `${URL}`,
      },
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
      .request(options, (response: Response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(200).json({
            message: "sub account payment ",
            status: 200,
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error: Error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error: any) {
    res.status(404).json({
      message: "Errror",
      data: error.message,
    });
  }
};

export const makeSplitSchoolfeePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { accountName, accountNumber, accountBankCode } = req.body;

    const params = JSON.stringify({
      business_name: accountName,
      settlement_bank: accountBankCode,
      account_number: accountNumber,
      percentage_charge: 5,
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
      .request(options, (response: Response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(200).json({
            message: "sub-account created",
            status: 200,
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error: Error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing store",
    });
  }
};

export const schoolFeePayment = async (req: Request, res: Response) => {
  try {
    const { subAccountCode, email, amount } = req.body;

    const params = JSON.stringify({
      email,
      amount: `${amount * 100}`,
      subaccount: subAccountCode,
      callback_url: `${URL}/school-fee-payment`,
      meta: {
        cancel: `${URL}`,
      },
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
      .request(options, (response: Response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(200).json({
            message: "sub account payment ",
            status: 200,
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error: Error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error: any) {
    res.status(404).json({
      message: "Errror",
      data: error.message,
    });
  }
};

export const makeOtherSchoolPayment = async (req: Request, res: Response) => {
  try {
    const { subAccountCode, email, paymentAmount, paymentName } = req.body;

    const params = JSON.stringify({
      email,
      amount: `${paymentAmount * 100}`,
      subaccount: subAccountCode,
      callback_url: `${URL}/other-school-payment`,
      meta: {
        cancel: `${URL}`,
      },
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
      .request(options, (response: Response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          return res.status(200).json({
            message: "other payment made successfully",
            status: 201,
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error: Error) => {
        console.error(error);
      });

    request.write(params);
    request.end();
  } catch (error: any) {
    res.status(404).json({
      message: "Errror",
      data: error.message,
    });
  }
};

export const verifySchoolTransaction = async (req: Request, res: Response) => {
  try {
    const { ref, studentID } = req.params;

    const student = await studentModel.findById(studentID);

    const school = await schoolModel.findById(student?.schoolIDs).populate({
      path: "session",
    });

    const readSession: any = school?.session?.find(
      (el: any) => el?._id === school?.presentSessionID
    );

    const termly: any = await sessionModel.findById(readSession?._id).populate({
      path: "term",
    });

    const readTerm: any = termly?.term?.find(
      (el: any) =>
        el?.presentTerm === school?.presentTerm &&
        el.presentTermID === school?.presentTermID
    );

    const mainTerm: any = await termModel.findById(readTerm?._id);

    const url: string = `https://api.paystack.co/transaction/verify/${ref}`;

    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
        },
      })
      .then(async (data: any) => {
        let id = crypto.randomBytes(4).toString("hex");

        console.log(data);

        let newData = await termModel.findByIdAndUpdate(
          mainTerm?._id,
          {
            otherPaymentRecord: [
              ...mainTerm?.otherPaymentRecord,
              { id, paymentDetails: "payment", paymentAmount: data?.amount },
            ],
          },
          { new: true }
        );
        console.log(newData);

        return res.status(200).json({
          message: "payment verified",
          status: 200,
          data: data.data,
          newData,
        });
      });
  } catch (error: any) {
    res.status(404).json({
      message: "Errror",
      data: error.message,
    });
  }
};
