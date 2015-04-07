/**
 * Stripe Customer Model
 *
 * <%= whatIsThis %>.
 * 
 * Refer to Stripe Documentation https://stripe.com/docs/api#customers
 */

module.exports = {
	
	autoPK: false,
	attributes: {
		
		id: {
			type: 'string',
			primaryKey: true,
    		unique: true
		},
		object: {
			type: 'string'
		},
		created: {
			type: 'datetime'
		},
		livemode: {
			type: 'boolean'
		},
		description: {
			type: 'string'
		},
		email: {
			type: 'string'
		},
		delinquent: {
			type: 'boolean'
		},
		metadata: {
			type: 'json'
		},
		subscriptions: {
			type: 'json'
		},
		discount: {
			type: 'integer'
		},
		account_balance: {
			type: 'integer'
		},
		currency: {
			type: 'string'
		},
		cards: {
			type: 'json'
		},
		default_card: {
			type: 'string'
		},

		//Added to Model and doesn't exists in Stripe
		lastStripeEvent: {
			type: 'datetime'
		}
	},

	beforeValidate: function (values, cb){
		if(values.created){
			values.created = new Date(values.created * 1000);
		}
		cb();
	},
	
	// Stripe Webhook customer.updated
	stripeCustomerCreated: function (customer, cb) {

		Customer.findOrCreate(customer.id, customer)
	    .exec(function (err, createdCustomer){
	      if (err) return cb(err);
	      if (createdCustomer.lastStripeEvent >= customer.lastStripeEvent) return cb(null, createdCustomer);
	      Customer.update(createdCustomer.id, customer)
	      .exec(function(err, updatedCustomers){
	      	if (err) return cb(err);
	      	Customer.afterStripeCustomerCreated(updatedCustomers[0], function(err, customer){
	      		cb(err, customer);
	      	});
	      });
	    });
	}, 

	afterStripeCustomerCreated: function (customer, next){
		//Add somethings to do after a customer is created
		next(null, customer);
	},

	// Stripe Webhook customer.updated
	stripeCustomerUpdated: function (customer, cb) {

		Customer.findOrCreate(customer.id, customer)
	    .exec(function (err, foundCustomer){
	      if (err) return cb(err);
	      if (foundCustomer.lastStripeEvent >= customer.lastStripeEvent) return cb(null, foundCustomer);
	      Customer.update(foundCustomer.id, customer)
	      .exec(function(err, updatedCustomers){
	      	if (err) return cb(err);
	      	Customer.afterStripeCustomerUpdated(updatedCustomers[0], function(err, customer){
	      		cb(err, customer);
	      	});
	      });
	    });
	},

	afterStripeCustomerUpdated: function(customer, next){
		//Add somethings to do after a customer is updated
		next(null, customer);
	},

	// Stripe Webhook customer.deleted
	stripeCustomerDeleted: function (customer, cb){
		Customer.destroy(customer.id)
	    .exec(function (err, destroyedCustomers){
	      if (err) return cb(err);
	      if(!destroyedCustomers) return cb(null, null);
	      Customer.afterStripeCustomerDeleted(destroyedCustomers[0], function(err, customer){
	      	cb(err,customer);
	      });
	    });
	},

	afterStripeCustomerDeleted: function(customer, next){
		//Add somethings to do after a customer is deleted
		next(null, customer);
	}
};