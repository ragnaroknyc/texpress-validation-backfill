import _ from "lodash";
import * as csvStringify from "csv-stringify";
import csvParser from "csv-parser";
import fs from "fs";

const TAG = 'tag_';
const PLATE = "plate_";
const PLATE_STATE = "plate_state_";
const STATUS = "status_";

const inputCsvPath = "./csv/new-input.csv";
let inputCsvData = [];

const outputCsvPath1 = "./csv/new-output-1.csv";
const outputCsvPath2 = "./csv/new-output-2.csv";
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
                output[`${STATUS}${order}`] = d['TVL Status Valid or Invalid'];
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
          const middleIndex = Math.ceil(outputCsvData.length / 2);

          const part1 = outputCsvData.splice(0, middleIndex);
          part1[0] = outputCsvHeader;
          csvStringify.stringify(part1, (e, o) => {
            fs.writeFileSync(outputCsvPath1, o);
            console.log("The 1st file has been successfully generated.");
          });

          const part2 = outputCsvData.splice(-middleIndex);
          part2[0] = outputCsvHeader;
          csvStringify.stringify(part2, (e, o) => {
            fs.writeFileSync(outputCsvPath2, o);
            console.log("The 2nd file has been successfully generated.");
          });
        }
      }
    });
};

handler();
