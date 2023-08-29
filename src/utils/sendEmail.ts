const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


// Define a function to send the order confirmation email
export const sendOrderConfirmationEmail = async (email: string, orderId: string, products: any[], totalAmount: number,paymentMethod:string,shippingAddress:string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Order Confirmation',
      html: `
      <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            
              <div style="background-color: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
            
                <h1 style="color: #333;">Order Confirmation</h1>
            
                <p>Hello ${email}. <br>Your order with ID <strong>${orderId}</strong> has been placed successfully.</p>
            
                <h2>Order Details:</h2>
                
                <p>Total Amount: <strong>$${totalAmount}</strong></p>
                <p>Payment method: <strong>${paymentMethod}</strong></p>
                <p>Shipping Address: <strong>${shippingAddress}</strong></p>

                <p>Thank you for shopping with us!</p>
              </div>
            
            </body>
            </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
