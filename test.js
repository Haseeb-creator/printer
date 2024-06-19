const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
const port = 5002;
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

app.use(cors());

const print = () => {
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "printer:RECIEPT PRINTER",
    driver: require("printer"),
  });

  // Shop Details
  //Order Details
  //Product Details
  //Total
  //Payment
  //QR
  //Thank you note

  printer.alignCenter();
  printer.setTextQuadArea();
  printer.println("96 LAKH Mobiles");
  printer.setTextNormal();
  printer.alignCenter();
  printer.println("Shop No 3 , Kali Masjid Complex, Chitguppa");
  printer.println("Phone:901933561");
  printer.setTextNormal();
  printer.newLine();

  // payment details

  printer.newLine(); //bank line
  printer.println("Thank you for availing our services!");
  printer.setTextNormal();
  printer.newLine();
  printer.cut();

  try {
    let execute = printer.execute();
    console.error("Print done!");
  } catch (error) {
    console.log("Print failed:", error);
  }
};

print();
