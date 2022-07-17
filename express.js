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
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, phone } = req.body
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'printer:auto',
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
    let month = date.getMonth()
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
  printer.println('96 LAKH ENTERPRISES')
  printer.setTextNormal()
  printer.alignCenter()
  printer.println('Beside SBI Bank Chitguppa-585412')
  printer.println('Phone:9902416190')
  printer.println('INVOICE')
  printer.println('GST:ADFH48934TBW33498T')
  printer.setTextNormal()
  printer.newLine()

  // payment details
  printer.tableCustom([
    { text: `Payment : ${paymentMethod}`, align: 'LEFT', cols: 15, bold: true },
    {
      text: '',
      align: 'CENTER',
      cols: 2,
      bold: true,
    },

    { text: 'Invoice No : 20221234', align: 'RIGHT', cols: 25, bold: true },
  ])

  // date and time details

  printer.tableCustom([
    { text: `Time : ${time}`, align: 'LEFT', cols: 15, bold: true },
    {
      text: '',
      align: 'CENTER',
      cols: 2,
      bold: true,
    },

    { text: `Date: ${date}`, align: 'RIGHT', cols: 25, bold: true },
  ])
  printer.drawLine()

  // order header details
  printer.tableCustom([
    { text: 'Description', align: 'LEFT', cols: 22, bold: true },
    {
      text: 'Qty',
      align: 'LEFT',
      cols: 5,
      bold: true,
    },
    {
      text: 'Dis',
      align: 'RIGHT',
      cols: 5,
      bold: true,
    },
    { text: 'Price', align: 'RIGHT', cols: 10, bold: true },
  ])

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
      {
        text: `${Math.round((item.mrp - item.price) * item.qty, 0)}`,
        align: 'RIGHT',
        cols: 5,
      },
      { text: item.price * item.qty, align: 'RIGHT', cols: 10 },
    ])
  })
  printer.newLine()
  printer.underline(true)
  // total details
  printer.tableCustom([
    { text: 'TOTAL', align: 'LEFT', cols: 22, bold: true },
    {
      text: calculateTotalItems(orderItems),
      align: 'LEFT',
      cols: 5,
      bold: true,
    },
    {
      text: calculateTotalSavings(orderItems),
      align: 'RIGHT',
      cols: 5,
      bold: true,
    },
    { text: Math.round(totalPrice, 0), align: 'RIGHT', cols: 10, bold: true },
  ])
  printer.underline(false)
  //Discount details
  printer.tableCustom([{ text: `SAVINGS :  ${calculateTotalSavings(orderItems)} `, align: 'LEFT', cols: 17, bold: true }])

  printer.newLine() //bank line
  printer.println('Scan to Order Online')
  printer.printQR('https://www.bidarmall.com', {
    cellSize: 6, // 1 - 8
    correction: 'M', // L(7%), M(15%), Q(25%), H(30%)
    model: 2, // 1 - Model 1
    // 2 - Model 2 (standard)
    // 3 - Micro QR
  })

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

app.listen(port, () => {
  console.log(`Print Server listening on port ${port}`)
})
