import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import termModel from "../model/termModel";
import expenseModel from "../model/expenseModel";
import { Types } from "mongoose";

export const createExpenditure = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { item, description, amount, paymentCategory, paymentMode } =
      req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID);

      if (getTerm) {
        let createExpense = await expenseModel.create({
          item,
          description,
          amount,
          paymentCategory,
          paymentMode,
        });

        getTerm?.expense.push(new Types.ObjectId(createExpense?._id));
        getTerm?.save();

        return res.status(201).json({
          message: "expense added successfully",
          data: createExpense,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to read school term",
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const readTermExpenditure = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID).populate({
        path: "expense",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      });

      return res.status(201).json({
        message: "retriving expense successfully",
        data: getTerm,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const readTermBudget = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID).populate({
        path: "expense",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      });

      return res.status(201).json({
        message: "retriving term budget successfully",
        data: getTerm?.budget,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const setTermlyBudget = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { budget } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findByIdAndUpdate(
        school.presentTermID,
        {
          budget,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "retriving expense successfully",
        data: getTerm,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};
