import { Document, ObjectId, Types } from "mongoose";
import StageModel from "../models/stage.model";
import GuidanceModel from "../models/guidance.model";
import QuestionModel, { QuestionDocument } from "../models/question.model";
import VideoModel from "../models/video.model";
import AnswerModel, { AnswerDocument } from "../models/answer.model";
import { PDFDocument as pdfLibDocument } from "pdf-lib";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import path from "path";

export const getStageInformation = async (
  stageId: Types.ObjectId | ObjectId,
  userId: ObjectId
) => {
  const stage = await StageModel.findById(stageId);
  const guidances = await GuidanceModel.find({
    "stage.id": stageId,
  }).select("guidance");
  const questions = await QuestionModel.find({
    "stage.id": stageId,
  }).select("questionText");
  const video = await VideoModel.findOne({ "stage.id": stageId }).select("url");
  const answers = await AnswerModel.find({
    stageId: stageId,
    userId,
  });

  return {
    name: stage?.name,
    title: stage?.title,
    description: stage?.description,
    canSkip: stage?.canSkip,
    guidances,
    questions: questions.map((question) => ({
      _id: question._id,
      questionText: question.questionText,
      answer:
        answers.find((ans) => question._id.equals(ans.question.id))?.answer ||
        "",
    })),
    video,
  };
};

export const mergePdfFile = async (files: string[], mergedFilePath: string) => {
  const mergedDoc = await pdfLibDocument.create();
  for (let i = 0; i < files.length; i++) {
    const pdfContent = await fs.promises.readFile(files[i]);
    const pdf = await pdfLibDocument.load(pdfContent);
    const copiedPdfPages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
    copiedPdfPages.forEach((page) => mergedDoc.addPage(page));
  }
  const mergedPdfBytes = await mergedDoc.save();
  await fs.promises.writeFile(mergedFilePath, mergedPdfBytes);
};

export const generateAnswersPdfFile = (
  foundQuestions: (Document<unknown, {}, QuestionDocument> &
    QuestionDocument & {
      _id: Types.ObjectId;
    })[],
  answers: (Document<unknown, {}, AnswerDocument> &
    AnswerDocument & {
      _id: Types.ObjectId;
    })[],
  filePath: string
) => {
  const boldFontPath = path.join(
    __dirname,
    "..",
    "..",
    "static",
    "fonts",
    "NotoSansArabic_Condensed-Bold.ttf"
  );
  const normalFontPath = path.join(
    __dirname,
    "..",
    "..",
    "static",
    "fonts",
    "NotoSansArabic_Condensed-Regular.ttf"
  );
  const boldFont = fs.readFileSync(boldFontPath);
  const normalFont = fs.readFileSync(normalFontPath);
  const doc = new PDFDocument({
    margins: {
      top: 30,
      bottom: 10,
      left: 10,
      right: 30,
    },
  });
  doc.registerFont(`bold`, boldFont);
  doc.registerFont(`normal`, normalFont);

  foundQuestions.forEach((question, index) => {
    const questionText = question.questionText.replace(/\d+/g, (match) =>
      match.split("").reverse().join("")
    );
    const answer =
      answers
        .find((ans) => question._id.equals(ans.question.id))
        ?.answer.replace(/\d+/g, (match) =>
          match.split("").reverse().join("")
        ) || "";
    doc
      .fontSize(11)
      .font("bold")

      .text(`السؤال ${index + 1}: ${questionText}`, {
        features: ["rtbd"],
        align: "right",
      });
    doc
      .fontSize(10)
      .font("normal")
      .text(`الإجابة: ${answer}`, { features: ["rtbd"], align: "right" }) // إضافة الإجابة باللغة العربية
      .moveDown();
  });
  doc.pipe(fs.createWriteStream(filePath));
  doc.end();
};
