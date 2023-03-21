import _ from "lodash";
import * as csvStringify from "csv-stringify";
import csvParser from "csv-parser";
import fs from "fs";

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
          d.email.toLowerCase()
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
                const { Plate, state, type, status, status_updated } = d;
                const order = i + 1;
                output[`plate_${order}`] = Plate;
                output[`state_${order}`] = state;
                output[`type_${order}`] = type;
                output[`status_${order}`] = status;
                output[`status_updated_${order}`] = status_updated;

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
            outputCsvHeader[`plate_${order}`] = `plate_${order}`;
            outputCsvHeader[`state_${order}`] = `state_${order}`;
            outputCsvHeader[`type_${order}`] = `type_${order}`;
            outputCsvHeader[`status_${order}`] = `status_${order}`;
            outputCsvHeader[`status_updated_${order}`] = `status_updated_${order}`;
          }
          outputCsvData[0] = outputCsvHeader;

          console.log("outputCsvData", outputCsvData);
          csvStringify.stringify(outputCsvData, (e, o) =>
            fs.writeFileSync(outputCsvPath, o)
          );
        }
      }
    });
};

handler();
