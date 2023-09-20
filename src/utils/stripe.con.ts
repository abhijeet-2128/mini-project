const stripe = require('stripe')('sk_test_51Ng5VRSDGc9VTgGkVvLh6Nk4BYBN1fti7YYr9lZce0tbo5aQdtoP4GH3Q2SfIffgFkpDo2F5tYUtninF7ui6YQQG00Uc8BCNSz');
export async function createStripe(cart:any,customerEmail:string,savedOrder:any){
      const session = await stripe.checkout.sessions.create({
          line_items: cart.products.map((item: { unit_price: number; quantity: any; }) => ({
            price_data: {
              currency: 'inr',
              unit_amount: item.unit_price * 100,
              product_data: {
                name: "Items",
                description: "Please pay for your order",
              },
            },
            quantity: item.quantity,
          })),
          mode: 'payment',
          payment_intent_data: {
            setup_future_usage: 'on_session',
          },
          customer_email: customerEmail,
          success_url: `${process.env.SERVER_URL}/public/success.html?orderId=${savedOrder._id}`,
          cancel_url: `${process.env.SERVER_URL}/public/cancel.html`,
        });
        console.log(session);
        return session.url;
}
