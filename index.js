import _ from "lodash";
import * as csvStringify from "csv-stringify";
import csvParser from "csv-parser";
import fs from "fs";

const TAG = 'tag_';
const PLATE = "plate_";
const PLATE_STATE = "plate_state_";
const STATUS = "status_";

const inputCsvPath = "./csv/input.csv";
let inputCsvData = [];

const outputCsvPath = "./csv/output.csv";
let countOutputCsvHeader = 0;
let outputCsvData = [{}];


const handler = () => {
  fs.createReadStream(inputCsvPath)
    .pipe(csvParser())
    .on("data", (d) => inputCsvData.push(d))
    .on("end", () => {
      if (inputCsvData && inputCsvData.length > 0) {
        const inputCsvDataGrouped = _.groupBy(inputCsvData, (d) =>
          d['Email'].toLowerCase()
        );
        if (inputCsvDataGrouped) {
          Object.keys(inputCsvDataGrouped).forEach((email) => {
            if (
              inputCsvDataGrouped[email] &&
              inputCsvDataGrouped[email].length > 0
            ) {
              let output = {
                email: email.toLowerCase(),
              };
              inputCsvDataGrouped[email].forEach((d, i) => {
                const order = i + 1;
                output[`${TAG}${order}`] = d['Tag'];
                output[`${PLATE}${order}`] = d['Plate'];
                output[`${PLATE_STATE}${order}`] = d['Plate State'];
                output[`${STATUS}${order}`] = d['Status'];
                if (countOutputCsvHeader <= i) {
                  countOutputCsvHeader++;
                }
              });
              outputCsvData.push(output);
            }
          });
        }
        if (outputCsvData && outputCsvData.length > 0) {
          let outputCsvHeader = {
            email: 'email'
          };
          for (let i = 0; i < countOutputCsvHeader; i++) {
            const order = i + 1;
            outputCsvHeader[`${TAG}${order}`] = `${TAG}${order}`;
            outputCsvHeader[`${PLATE}${order}`] = `${PLATE}${order}`;
            outputCsvHeader[`${PLATE_STATE}${order}`] = `${PLATE_STATE}${order}`;
            outputCsvHeader[`${STATUS}${order}`] = `${STATUS}${order}`;
          }
          outputCsvData[0] = outputCsvHeader;

          csvStringify.stringify(outputCsvData, (e, o) =>
            fs.writeFileSync(outputCsvPath, o)
          );
        }
      }
    });
};

handler();
