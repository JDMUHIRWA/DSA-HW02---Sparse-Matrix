class SparseMatrix {
  constructor(matrixFilePath = null, numRows = null, numCols = null) {
    if (matrixFilePath) {
      this.loadFromFile(matrixFilePath);
    } else if (numRows && numCols) {
      this.numRows = numRows;
      this.numCols = numCols;
      this.matrix = {};
    }
  }

  // Loads the matrix from a file
  loadFromFile(matrixFilePath) {
    const fs = require("fs");
    const data = fs.readFileSync(matrixFilePath, "utf8");
    const lines = data.trim().split("\n");

    try {
      this.numRows = parseInt(lines[0].split("=")[1]);
      this.numCols = parseInt(lines[1].split("=")[1]);
      this.matrix = {};

      for (let i = 2; i < lines.length; i++) {
        const [row, col, value] = lines[i]
          .replace(/[()]/g, "")
          .split(",")
          .map(Number);
        this.setElement(row, col, value);
      }
    } catch (e) {
      throw new Error("Input file has wrong format: " + e.message);
    }
  }

  // Gets the element at (currRow, currCol), returns 0 if not set
  getElement(currRow, currCol) {
    return this.matrix[`${currRow},${currCol}`] || 0;
  }

  // Sets the element at (currRow, currCol), if value is 0, removes it from the matrix
  setElement(currRow, currCol, value) {
    if (value !== 0) {
      this.matrix[`${currRow},${currCol}`] = value;
    } else {
      delete this.matrix[`${currRow},${currCol}`];
    }
  }

  // Adds two sparse matrices
  add(otherMatrix) {
    const result = new SparseMatrix(null, this.numRows, this.numCols);

    const keys = new Set([
      ...Object.keys(this.matrix),
      ...Object.keys(otherMatrix.matrix),
    ]);

    keys.forEach((key) => {
      const [row, col] = key.split(",").map(Number);
      const sumValue =
        this.getElement(row, col) + otherMatrix.getElement(row, col);
      result.setElement(row, col, sumValue);
    });

    return result;
  }

  // Subtracts one sparse matrix from another
  subtract(otherMatrix) {
    const result = new SparseMatrix(null, this.numRows, this.numCols);

    const keys = new Set([
      ...Object.keys(this.matrix),
      ...Object.keys(otherMatrix.matrix),
    ]);

    keys.forEach((key) => {
      const [row, col] = key.split(",").map(Number);
      const diffValue =
        this.getElement(row, col) - otherMatrix.getElement(row, col);
      result.setElement(row, col, diffValue);
    });

    return result;
  }

  // Multiplies two sparse matrices
  multiply(otherMatrix) {
    if (this.numCols !== otherMatrix.numRows) {
      throw new Error(
        "Number of columns of first matrix must be equal to number of rows of second matrix"
      );
    }

    const result = new SparseMatrix(null, this.numRows, otherMatrix.numCols);

    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < otherMatrix.numCols; j++) {
        let value = 0;
        for (let k = 0; k < this.numCols; k++) {
          value += this.getElement(i, k) * otherMatrix.getElement(k, j);
        }
        result.setElement(i, j, value);
      }
    }

    return result;
  }

  // Converts the sparse matrix to string format
  toString() {
    const result = [];
    Object.keys(this.matrix).forEach((key) => {
      const [row, col] = key.split(",").map(Number);
      result.push(`(${row}, ${col}, ${this.matrix[key]})`);
    });
    return result.join("\n");
  }
}

// Function to write a matrix to a file
function writeMatrixToFile(matrix, filePath) {
  const fs = require("fs");
  const data = `rows=${matrix.numRows}\ncols=${
    matrix.numCols
  }\n${matrix.toString()}`;
  fs.writeFileSync(filePath, data, "utf8");
}

// Example usage:
const matrix1 = new SparseMatrix("./matrix1.txt");
const matrix2 = new SparseMatrix("./matrix2.txt");

const additionResult = matrix1.add(matrix2);
const subtractionResult = matrix1.subtract(matrix2);
const multiplicationResult = matrix1.multiply(matrix2);

writeMatrixToFile(additionResult, "./addition_result.txt");
writeMatrixToFile(subtractionResult, "./subtraction_result.txt");
writeMatrixToFile(multiplicationResult, "./multiplication_result.txt");
