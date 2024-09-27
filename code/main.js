function main() {
  const input1 = "/sample_input_for_students 2/matrixfile1.txt";
  const input2 = "/sample_input_for_students 2/matrixfile2.txt";

  const matrix1 = new SparseMatrix(input1);
  const matrix2 = new SparseMatrix(input2);

  console.log("Select the operation to perform:");
  console.log("1. Addition");
  console.log("2. Subtraction");
  console.log("3. Multiplication");

  const operation = prompt("Enter operation (1/2/3): ").trim();

  let result;
  const outputFilePath = "/sample_outputs/result.txt";

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
