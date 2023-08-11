
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public')); 

mongoose.connect('mongodb://localhost/online-store', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const receiptSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postCode: String,
    province: String,
    products: [{
        name: String,
        quantity: Number
    }],
    shippingCost: Number,
    deliveryTime: String,
    total: Number,
    taxRate: Number, 
    tax: Number,     
    timestamp: Date
});

const Receipt = mongoose.model('Receipt', receiptSchema);

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/views/receipt', async (req, res) => { 
    const formData = req.body; 

    // Calculating the total price based on the selected products and quantities
    let total = 0;
    formData.products.forEach(product => {
        
        const productPrice = 10; 
        total += product.quantity * productPrice;
    });
    
      //  shipping charge
      const shippingCost = 20;
      total += shippingCost;

       // tax based on province 
       const province = formData.province;
       let taxRate = 0;
       switch (province) {
           case 'Alberta':
               taxRate = 0.05;
               break;
           case 'British Columbia':
               taxRate = 0.12;
               break;
           case 'Manitoba':
               taxRate = 0.13;
               break;
           case 'New Brunswick':
               taxRate = 0.15;
               break;
           case 'Newfoundland and Labrador':
               taxRate = 0.15;
               break;
           case 'Northwest Territories':
               taxRate = 0.05;
               break;
           case 'Nova Scotia':
               taxRate = 0.15;
               break;
           case 'Nunavut':
               taxRate = 0.05;
               break;
           case 'Ontario':
               taxRate = 0.13;
               break;
           case 'Prince Edward Island':
               taxRate = 0.15;
               break;
           case 'Quebec':
               taxRate = 0.14975;
               break;
           case 'Saskatchewan':
               taxRate = 0.11;
               break;
           case 'Yukon':
               taxRate = 0.05;
               break;
           default:
               taxRate = 0;
       }
       

    const tax = total * taxRate;
    total += tax;

    const receipt = new Receipt({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postCode: formData.postCode,
        province: formData.province,
        products: formData.products,
        deliveryTime: formData.deliveryTime,
        total: total,
        tax: tax,
          shippingCost: shippingCost,
        timestamp: new Date()
    });

    try {
        await receipt.save();
        console.log('Receipt saved to MongoDB');
    } catch (error) {
        console.error('Error saving receipt:', error);
    }

    res.render('receipt', { receipt }); 
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await Receipt.find().sort({ timestamp: -1 });
        res.render('orders', { orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
