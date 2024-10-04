const fs = require("fs");
const path = require("path");

class SparseMatrix {
  constructor(matrixFilePath = null, numRows = null, numCols = null) {
    if (matrixFilePath) {
      const { numRows, numCols, elements } =
        this.readMatrixFile(matrixFilePath);
      this.numRows = numRows;
      this.numCols = numCols;
      this.elements = elements;
    } else {
      this.numRows = numRows;
      this.numCols = numCols;
      this.elements = {};
    }
  }

  readMatrixFile(filePath) {
    const elements = {};
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    const numRows = parseInt(lines[0].split("=")[1]);
    const numCols = parseInt(lines[1].split("=")[1]);

    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith("(") && line.endsWith(")")) {
        const [row, col, value] = line.slice(1, -1).split(",").map(Number);
        if (!elements[row]) elements[row] = {};
        elements[row][col] = value;
      } else {
        throw new Error("Input file has wrong format");
      }
    }

    return { numRows, numCols, elements };
  }

  getElement(currRow, currCol) {
    return this.elements[currRow]?.[currCol] || 0;
  }

  setElement(currRow, currCol, value) {
    if (!this.elements[currRow]) this.elements[currRow] = {};
    this.elements[currRow][currCol] = value;
  }

  add(other) {
    if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
      throw new Error("Matrices dimensions do not match for addition");
    }
    const result = new SparseMatrix(null, this.numRows, this.numCols);
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const sumValue = this.getElement(row, col) + other.getElement(row, col);
        if (sumValue !== 0) {
          result.setElement(row, col, sumValue);
        }
      }
    }
    return result;
  }

  subtract(other) {
    if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
      throw new Error("Matrices dimensions do not match for subtraction");
    }
    const result = new SparseMatrix(null, this.numRows, this.numCols);
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const diffValue =
          this.getElement(row, col) - other.getElement(row, col);
        if (diffValue !== 0) {
          result.setElement(row, col, diffValue);
        }
      }
    }
    return result;
  }

  multiply(other) {
    if (this.numCols !== other.numRows) {
      throw new Error("Matrices dimensions do not match for multiplication");
    }
    const result = new SparseMatrix(null, this.numRows, other.numCols);
    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < other.numCols; j++) {
        let sumValue = 0;
        for (let k = 0; k < this.numCols; k++) {
          sumValue += this.getElement(i, k) * other.getElement(k, j);
        }
        if (sumValue !== 0) {
          result.setElement(i, j, sumValue);
        }
      }
    }
    return result;
  }

  toString() {
    const result = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let col in this.elements[row] || {}) {
        result.push(`(${row}, ${col}, ${this.elements[row][col]})`);
      }
    }
    return result.join("\n");
  }
}

function writeMatrixToFile(matrix, filePath) {
  const sampleOutputDir = path.join(__dirname, "..", "sample_outputs"); // Define the sample_outputs directory
  const fullFilePath = path.join(sampleOutputDir, filePath); // Combine output directory and file path

  fs.mkdirSync(path.dirname(fullFilePath), { recursive: true });
  const content = `rows=${matrix.numRows}\ncols=${
    matrix.numCols
  }\n${matrix.toString()}`;
  fs.writeFileSync(fullFilePath, content);
}

function main() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (query) =>
    new Promise((resolve) => readline.question(query, resolve));

  (async function () {
    while (true) {
      const file1 = await askQuestion(
        "Please enter the name of the first matrix file (inside sample_inputs): "
      );
      const file2 = await askQuestion(
        "Please enter the name of the second matrix file (inside sample_inputs): "
      );

      const matrixFile1Path = path.join(
        __dirname,
        "..",
        "sample_inputs",
        file1
      );
      const matrixFile2Path = path.join(
        __dirname,
        "..",
        "sample_inputs",
        file2
      );

      while (true) {
        console.log("Select the operation you want to perform:");
        console.log("1. Addition");
        console.log("2. Subtraction");
        console.log("3. Multiplication");
        const operation = await askQuestion(
          "Enter the number corresponding to the operation: "
        );

        const additionFile = "Addition_result.txt";
        const subtractionFile = "Subtraction_result.txt";
        const multiplicationFile = "Multiplication_result.txt";

        const matrix1 = new SparseMatrix(matrixFile1Path);
        const matrix2 = new SparseMatrix(matrixFile2Path);

        console.log(`Matrix 1: ${matrix1.numRows}x${matrix1.numCols}`);
        console.log(`Matrix 2: ${matrix2.numRows}x${matrix2.numCols}`);

        if (operation === "1") {
          if (
            matrix1.numRows === matrix2.numRows &&
            matrix1.numCols === matrix2.numCols
          ) {
            const additionResult = matrix1.add(matrix2);
            writeMatrixToFile(additionResult, additionFile);
            console.log("Addition result has been written to sample_outputs");
          } else {
            console.log("Skipping addition due to dimension mismatch");
          }
        } else if (operation === "2") {
          if (
            matrix1.numRows === matrix2.numRows &&
            matrix1.numCols === matrix2.numCols
          ) {
            const subtractionResult = matrix1.subtract(matrix2);
            writeMatrixToFile(subtractionResult, subtractionFile);
            console.log(
              "Subtraction result has been written to sample_outputs"
            );
          } else {
            console.log("Skipping subtraction due to dimension mismatch");
          }
        } else if (operation === "3") {
          if (matrix1.numCols === matrix2.numRows) {
            const multiplicationResult = matrix1.multiply(matrix2);
            writeMatrixToFile(multiplicationResult, multiplicationFile);
            console.log(
              "Multiplication result has been written to sample_outputs"
            );
          } else {
            console.log("Skipping multiplication due to dimension mismatch");
          }
        } else {
          console.log("Invalid operation selected");
        }

        const continueChoice = await askQuestion(
          "Do you want to perform another operation? (yes/no): "
        );
        if (continueChoice.trim().toLowerCase() !== "yes") break;
      }

      const newFilesChoice = await askQuestion(
        "Do you want to input new files? (yes/no): "
      );
      if (newFilesChoice.trim().toLowerCase() !== "yes") break;
    }

    readline.close();
  })();
}

main();
