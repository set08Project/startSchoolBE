import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import { streamUpload } from "../utils/streamifier";
import gallaryModel from "../model/gallaryModel";

export const createSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, description } = req.body;

    const school = await schoolModel.findById(schoolID);

    const { secure_url, public_id }: any = await streamUpload(req);

    if (school) {
      const store = await gallaryModel.create({
        title,
        description,
        avatar: secure_url,
        avatarID: public_id,
      });

      school?.gallaries.push(new Types.ObjectId(store._id));
      school.save();

      return res.status(201).json({
        message: "image uploaded gallary successfully",
        data: store,
        status: 201,
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

export const createRestrictedSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, description } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "gallaries",
    });

    if (school) {
      if (school?.gallaries?.length! > 10) {
        return res.status(404).json({
          message: "Please upgrade your account to upload more images",
          status: 404,
        });
      } else {
        const { secure_url, public_id }: any = await streamUpload(req);

        const gallary = await gallaryModel.create({
          title,
          description,
          avatar: secure_url,
          avatarID: public_id,
        });

        school?.gallaries.push(new Types.ObjectId(gallary._id));
        school.save();

        return res.status(201).json({
          message: "image uploaded gallary successfully",
          data: gallary,
          status: 201,
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

export const viewSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const gallary = await schoolModel.findById(schoolID).populate({
      path: "gallaries",
    });

    return res.status(200).json({
      message: "viewing school gallaries",
      data: gallary?.gallaries,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};
