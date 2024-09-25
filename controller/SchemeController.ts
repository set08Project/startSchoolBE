import express, { Request, Response } from "express";
import fs from "fs"; 
import schemeOfWorkModel from "../model/schemeOfWorkModel";
import schoolModel from "../model/schoolModel";

export const createScheme = async (req: Request, res: Response) => {
  try {
    const { schoolID } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const data = fs.readFileSync(filePath, "utf-8");

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError: any) {
      return res.status(400).json({
        message: "Invalid JSON format in the uploaded file",
        error: parseError.message,
      });
    }

    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ message: "Uploaded file should contain an array of schemes." });
    }

    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const schemesToInsert = jsonData.map((item: any) => ({
      school: schoolID, 
      weeks: item.weeks,
      topics: item.topics || [], 
      subject: item.subject,
      classType: item.class,
      term: item.term,
      learningObject: item.learningObjects || [], 
      learningActivities: item.learningActivities || [],
      embeddedCoreSkills: item.embeddedCoreSkills || [],
      learningResource: item.learningResources || [],
      createdAt: new Date(), 
      updatedAt: new Date() 
    }));

    const insertedSchemes = await schemeOfWorkModel.insertMany(schemesToInsert);

    return res.status(201).json({
      message: "Successfully processed and inserted schemes.",
      status: 201,
      data: insertedSchemes 
    });

  } catch (error: any) {
    console.error("Error while processing bulk upload:", error);
    return res.status(500).json({
      message: "An error occurred while processing the bulk upload.",
      error: error.message,
    });
  }
};




export const getSchemeOfWork = async (req: Request, res: Response) => {
  try {
    const getScheme = await schemeOfWorkModel.find()

    return res.status(200).json({
      message: "Successfully getting scheme of work entry.",
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error processed scheme of work entry.",
      status: 201,
    });
  }
}
