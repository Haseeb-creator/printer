const express = require('express')
const bp = require('body-parser')
const cors = require('cors')
const app = express()
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
const port = 5002
const ThermalPrinter = require('node-thermal-printer').printer
const PrinterTypes = require('node-thermal-printer').types

app.use(cors())

app.post('/print', (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, store, itemsPrice, taxPrice, shippingPrice, totalPrice, phone, invoiceId } = req.body
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'printer:POS PRINTER',
    driver: require('printer'),
  })

  function formatTime(date) {
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    let strTime = hours + ':' + minutes + ' ' + ampm
    return strTime
  }

  function formatDate(date) {
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    day = day < 10 ? '0' + day : day
    month = month < 10 ? '0' + month : month
    let formattedDate = day + '/' + month + '/' + year
    return formattedDate
  }

  function calculateDiscount(item) {
    return Math.round(((item.mrp - item.price) / item.mrp) * 100) < 10 ? '0' + Math.round(((item.mrp - item.price) / item.mrp) * 100) : Math.round(((item.mrp - item.price) / item.mrp) * 100)
  }

  function calculateTotalSavings(orderItems) {
    let totalSavings = 0
    orderItems.map((item) => {
      totalSavings = totalSavings + (item.mrp - item.price) * item.qty
    })

    return totalSavings
  }

  function calculateTotalItems(orderItems) {
    let totalItems = 0
    orderItems.map((item) => {
      totalItems = totalItems + item.qty
    })

    return totalItems
  }

  const todaysDate = new Date()
  const time = formatTime(todaysDate)
  const date = formatDate(todaysDate)

  // Shop Details
  //Order Details
  //Product Details
  //Total
  //Payment
  //QR
  //Thank you note

  printer.alignCenter()
  printer.setTextQuadArea()
  printer.println(store.company)
  printer.setTextNormal()
  printer.alignCenter()
  printer.println(store.address)
  printer.println(store.name)
  printer.println('INVOICE')
  printer.setTextNormal()
  printer.newLine()

  // payment details
  printer.tableCustom([
    { text: `Payment : ${paymentMethod}`, align: 'LEFT', cols: 22, bold: true },
    {
      text: '',
      align: 'CENTER',
      cols: 2,
      bold: true,
    },

    { text: `Invoice No : ${invoiceId}`, align: 'RIGHT', cols: 24, bold: true },
  ])

  // date and time details

  printer.tableCustom([
    { text: `Time : ${time}`, align: 'LEFT', cols: 22, bold: true },
    {
      text: '',
      align: 'CENTER',
      cols: 2,
      bold: true,
    },

    { text: `Date: ${date}`, align: 'RIGHT', cols: 24, bold: true },
  ])
  printer.drawLine()
  // order header details
  printer.tableCustom([
    { text: 'ITEM NAME', align: 'LEFT', cols: 22, bold: true },
    {
      text: 'QTY',
      align: 'LEFT',
      cols: 5,
      bold: true,
    },
    { text: 'MRP', align: 'LEFT', cols: 6, bold: true },
    {
      text: 'PRICE',
      align: 'LEFT',
      cols: 8,
      bold: true,
    },
    { text: 'AMOUNT', align: 'LEFT', cols: 7, bold: true },
  ])
  printer.drawLine()

  //order items details
  orderItems.map((item) => {
    printer.beep()

    let discount = calculateDiscount(item)
    printer.tableCustom([
      { text: item.name, align: 'LEFT', cols: 22 },
      {
        text: item.qty,
        align: 'LEFT',
        cols: 5,
      },
      { text: item.mrp, align: 'LEFT', cols: 6 },
      {
        text: item.price,
        align: 'LEFT',
        cols: 8,
      },
      { text: item.price * item.qty, align: 'LEFT', cols: 7 },
    ])
  })
  printer.drawLine()

  // total details
  printer.tableCustom([
    { text: 'TOTAL', align: 'LEFT', cols: 22, bold: true },
    {
      text: calculateTotalItems(orderItems),
      align: 'LEFT',
      cols: 5,
      bold: true,
    },
    { text: '', align: 'LEFT', cols: 6 },
    {
      text: '',
      align: 'LEFT',
      cols: 8,
      bold: true,
    },
    { text: `${Math.round(totalPrice, 0)} `, align: 'LEFT', cols: 7, bold: true },
  ])
  printer.drawLine()
  //Discount details
  printer.tableCustom([{ text: `YOU SAVED : Rs ${calculateTotalSavings(orderItems)} `, align: 'CENTER', cols: 20, bold: true }])

  printer.newLine() //bank line
  printer.setTextSize(0, 1)
  printer.println('Thank you for shopping with us !')
  printer.setTextNormal()
  printer.newLine()



  printer.cut()

  try {
    let execute = printer.execute()
    console.error('Print done!')
    res.send('Print done!')
    res.statusCode = 200
  } catch (error) {
    console.log('Print failed:', error)
    res.send('Print failed:', error)
    res.statusCode = 500
  }
})

app.get('/', (req, res) => {
  res.send('Print Server is Running')
})

app.post('/label', (req, res) => {
  const { brand, name, size, mrp, price, tax, sku, category, description, countInStock, labels } = req.body;
  const Printer = require('printer');
  let name1 = name.substring(0, 20);
  let name2 = name.substring(20);

  // Calculate the number of times to repeat the print job
  const repeatCount = Math.ceil(labels / 3);

  // ZPL template with adjusted positions for 203 DPI
  const template = `^XA
  ^LL480  ; Total label length (160 dots * 3 labels)
  ^FW264  ; Label width (264 dots)

  ; Label 1
  ^FO70,10^A0N,24,24^FD${name1}^FS 
  ^FO70,33^A0N,24,24^FD${name2}^FS 
  ^FO240,33^A0N,24,24^FD${size}^FS 
  ^BY2,3,32^FO70,95^BCN,35,Y,N,N^FD${sku}^FS
  ^FO70,65^A0N,24,24^FDMRP: ${mrp}        SP: ${price}^FS 


  ; Label 2
  ^FO334,10^A0N,24,24^FD${name1}^FS 
  ^FO334,33^A0N,24,24^FD${name2}^FS 
  ^FO514,33^A0N,24,24^FD${size}^FS  
  ^BY2,3,32^FO334,95^BCN,35,Y,N,N^FD${sku}^FS 
  ^FO334,65^A0N,24,24^FDMRP: ${mrp}       SP: ${price}^FS


  ; Label 3
  ^FO598,10^A0N,24,24^FD${name1}^FS 
  ^FO598,33^A0N,24,24^FD${name2}^FS
  ^FO778,33^A0N,24,24^FD${size}^FS  
  ^BY2,3,32^FO598,95^BCN,35,Y,N,N^FD${sku}^FS
  ^FO598,65^A0N,24,24^FDMRP: ${mrp}       SP: ${price}^FS
  ^XZ`;

  function printZebra(template, printer_name) {
    Printer.printDirect({
      data: template,
      printer: printer_name,
      type: "RAW",
      success: function () {
        console.log("printed");
      },
      error: function (err) { console.log(err); }
    });
  }

  // Repeat the print job
  for (let i = 0; i < repeatCount; i++) {
    printZebra(template, "TVSELP");
  }

  res.send('Label printed')
});

app.listen(port, () => {
  console.log(`Print Server listening on port ${port}`)
})