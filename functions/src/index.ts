import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { validateCnpj, validateCpf } from "./validators";

admin.initializeApp();
exports.addDocument = functions.https.onRequest(async (req, res) => {
  const document = req.query.text;
  if (
    typeof document == "string" &&
    (!validateCnpj(document) || !validateCpf(document))
  ) {
    const duplicate = await admin
      .firestore()
      .collection("documents")
      .where("original", "==", document)
      .get();
    if (duplicate.empty) {
      const writeResult = await admin
        .firestore()
        .collection("documents")
        .add({ original: document });
      res.json({ result: `Message with ID:  ${writeResult.id} added.` });
    } else {
      res.status(400).send(`Documento já registrado na lista.`);
    }
  } else {
    res
      .status(400)
      .send(
        `Necessário enviar um CPF ou CNPJ válidos sem pontuação. Ex: 00478175000`
      );
  }
});
exports.documentExist = functions.https.onRequest(async (req, res) => {
  const document = req.query.text;
  const duplicates = await admin
    .firestore()
    .collection("documents")
    .where("original", "==", document)
    .get();
  if (duplicates.empty) {
    res.send("Documento não existe na lista");
  } else {
    res.send("Documento existe na lista");
  }
});
exports.getAllDocuments = functions.https.onRequest(async (req, res) => {  
  const documents:string[] = [];
  const duplicates = await admin
    .firestore()
    .collection("documents")
    .get();
    if (duplicates.empty) {
      res.send("Documento não existe na lista");
    } else {
      duplicates.forEach(e => documents.push(e.data().original));
      res.json({documents});
    }
});