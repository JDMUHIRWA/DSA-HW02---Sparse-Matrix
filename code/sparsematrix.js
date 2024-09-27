const fs = require("fs");

class SparseMatrix {
  constructor(matrixFilePath = null, numRows = null, numCols = null) {
    if (matrixFilePath) {
      this.loadFromFile(matrixFilePath);
    } else if (numRows !== null && numCols !== null) {
      this.numRows = numRows;
      this.numCols = numCols;
      this.matrix = {};
    }
  }

  // Method to load the matrix from file
  loadFromFile(matrixFilePath) {
    const data = fs.readFileSync(matrixFilePath, "utf8");
    const lines = data.trim().split("\n");

    try {
      this.numRows = parseInt(lines[0].split("=")[1].trim());
      this.numCols = parseInt(lines[1].split("=")[1].trim());
      this.matrix = {};

      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        if (!line.startsWith("(") || !line.endsWith(")")) {
          throw new Error("Input file has wrong format");
        }
        const [row, col, value] = line.slice(1, -1).split(",").map(Number);
        this.setElement(row, col, value);
      }
    } catch (error) {
      throw new Error(`Input file has wrong format: ${error.message}`);
    }
  }

  // Method to get an element from the matrix
  getElement(row, col) {
    return this.matrix[`${row},${col}`] || 0;
  }

  // Method to set an element in the matrix
  setElement(row, col, value) {
    if (value !== 0) {
      this.matrix[`${row},${col}`] = value;
    } else {
      delete this.matrix[`${row},${col}`];
    }
  }

  // Method to add two matrices
  add(otherMatrix) {
    if (
      this.numRows !== otherMatrix.numRows ||
      this.numCols !== otherMatrix.numCols
    ) {
      throw new Error("Matrices must have the same dimensions for addition");
    }

    const result = new SparseMatrix(null, this.numRows, this.numCols);

    for (const key of new Set([
      ...Object.keys(this.matrix),
      ...Object.keys(otherMatrix.matrix),
    ])) {
      const [row, col] = key.split(",").map(Number);
      const value =
        this.getElement(row, col) + otherMatrix.getElement(row, col);
      result.setElement(row, col, value);
    }

    return result;
  }

  // Method to subtract two matrices
  subtract(otherMatrix) {
    if (
      this.numRows !== otherMatrix.numRows ||
      this.numCols !== otherMatrix.numCols
    ) {
      throw new Error("Matrices must have the same dimensions for subtraction");
    }

    const result = new SparseMatrix(null, this.numRows, this.numCols);

    for (const key of new Set([
      ...Object.keys(this.matrix),
      ...Object.keys(otherMatrix.matrix),
    ])) {
      const [row, col] = key.split(",").map(Number);
      const value =
        this.getElement(row, col) - otherMatrix.getElement(row, col);
      result.setElement(row, col, value);
    }

    return result;
  }

  // Method to multiply two matrices
  multiply(otherMatrix) {
    if (this.numCols !== otherMatrix.numRows) {
      throw new Error(
        "Number of columns in the first matrix must equal the number of rows in the second matrix for multiplication"
      );
    }

    const result = new SparseMatrix(null, this.numRows, otherMatrix.numCols);

    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < otherMatrix.numCols; j++) {
        let value = 0;
        for (let k = 0; k < this.numCols; k++) {
          value += this.getElement(i, k) * otherMatrix.getElement(k, j);
        }
        if (value !== 0) {
          result.setElement(i, j, value);
        }
      }
    }

    return result;
  }

  // Method to write the matrix to a file
  writeToFile(outputFilePath) {
    const lines = [`rows=${this.numRows}`, `cols=${this.numCols}`];
    for (const [key, value] of Object.entries(this.matrix)) {
      const [row, col] = key.split(",");
      lines.push(`(${row}, ${col}, ${value})`);
    }
    fs.writeFileSync(outputFilePath, lines.join("\n"));
  }
}

function main() {
  const input1 =
    "/Users/muhirwa/DSA-HW02---Sparse-Matrix/sample_inputs/matrix1.txt";
  const input2 =
    "/Users/muhirwa/DSA-HW02---Sparse-Matrix/sample_inputs/matrixfile3.txt";

  const matrix1 = new SparseMatrix(input1);
  const matrix2 = new SparseMatrix(input2);

  console.log("Select the operation to perform:");
  console.log("1. Addition");
  console.log("2. Subtraction");
  console.log("3. Multiplication");

  const operation = prompt("Enter operation (1/2/3): ").trim();

  let result;
  const outputFilePath = "sample_outputs/result.txt";

  if (operation === "1") {
    result = matrix1.add(matrix2);
    result.writeToFile(outputFilePath);
    console.log("Addition result written to", outputFilePath);
  } else if (operation === "2") {
    result = matrix1.subtract(matrix2);
    result.writeToFile(outputFilePath);
    console.log("Subtraction result written to", outputFilePath);
  } else if (operation === "3") {
    result = matrix1.multiply(matrix2);
    result.writeToFile(outputFilePath);
    console.log("Multiplication result written to", outputFilePath);
  } else {
    console.log("Invalid operation selected.");
  }
}

main();
