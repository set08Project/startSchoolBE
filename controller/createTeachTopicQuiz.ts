import {Request, Response} from "express"

import subjectTeachesModel from "../model/teachSubjectModel";
import subjectTopicsModel from "../model/teachSubjectTopics";
import subjectTopicQuizesModel from "../model/teachTopicQuizesModel";
import { Types } from "mongoose";


export const createTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { question, explanation, correctAnswer, options } = req.body;

    const { topicID } = req.params;

    const getSubject = await subjectTopicsModel.findById(topicID);

    const teachSubject = await subjectTopicQuizesModel.create({
      question,
      explanation,
      correctAnswer,
      options,
    });

    getSubject?.quizQuestions.push(new Types.ObjectId(teachSubject._id));
    await getSubject?.save();

    return res.status(201).json({
      message: "teach subject created successfully",
      data: { teachSubject, getSubject },
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
      data: error,
    });
  }
};

export const updateTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teachSubjectTopicQuizID } = req.params;
    const { question, explanation, correctAnswer, options } = req.body;


    const teachSubject = await subjectTopicQuizesModel.findByIdAndUpdate(
      teachSubjectTopicQuizID,
      {
        question,
        explanation,
        correctAnswer,
        options,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "teach subject updated successfully",
      data: teachSubject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const getOneTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicID} = req.params
     const teachSubject = await subjectTopicsModel
       .findById(teachSubjectTopicID).populate({path: "quizQuestions"});


      return res.status(201).json({
        message: "teach subject created successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    console.log("error", error)
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const deleteOneTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicQuizID, subjectTopicID} = req.params

    const getSubject: any = await subjectTopicsModel.findById(subjectTopicID); 

    // await subjectTopicsModel.findByIdAndDelete(teachSubjectTopicQuizID);

     const teachSubject = await subjectTopicQuizesModel.findByIdAndDelete(
       teachSubjectTopicQuizID
     );

     getSubject?.quizQuestions?.pull(teachSubjectTopicQuizID!);
     await getSubject?.save();

      return res.status(201).json({
        message: "teach subject deleted successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    return res.status(404).json({
      message: "Error deleting teach subject ",
    });
  }
};

export const getAllTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {    


    const teachSubject = await subjectTeachesModel.find();

      return res.status(201).json({
        message: "teach subject created successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};